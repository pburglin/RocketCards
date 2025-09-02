#!/usr/bin/env node

// CLI tool for downloading card images locally with configurable throttling and retry mechanisms
// Usage: node image-export-cli.js [options]

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Card {
  id: string;
  title: string;
  description: string;
  imageDescription?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  cards: Card[];
}

interface ExportOptions {
  delay: number;
  retries: number;
  outputDir: string;
  collections: string[];
  forceOverwrite: boolean;
  forcePng: boolean;
  forceNoSafe: boolean;
}

class ImageExportCLI {
  private readonly DEFAULT_DELAY = 1000; // 1 second
  private readonly DEFAULT_RETRIES = 3;
  private readonly DEFAULT_OUTPUT_DIR = path.join(__dirname, '../../public/images/cards');
  private readonly COLLECTIONS = [
    'fantasy', 'politics', 'monsters', 'anime', 'scifi', 
    'soccer', 'lawyers', 'apocalypse', 'heroes'
  ];

  private options: ExportOptions;

  constructor() {
    this.options = {
      delay: this.DEFAULT_DELAY,
      retries: this.DEFAULT_RETRIES,
      outputDir: this.DEFAULT_OUTPUT_DIR,
      collections: this.COLLECTIONS,
      forceOverwrite: false,
      forcePng: false,
      forceNoSafe: false
    };
  }

  private async parseArguments(): Promise<void> {
    const args = process.argv.slice(2);
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--delay':
        case '-d':
          if (i + 1 < args.length) {
            this.options.delay = parseInt(args[++i]) || this.DEFAULT_DELAY;
          }
          break;
        case '--retries':
        case '-r':
          if (i + 1 < args.length) {
            this.options.retries = parseInt(args[++i]) || this.DEFAULT_RETRIES;
          }
          break;
        case '--output':
        case '-o':
          if (i + 1 < args.length) {
            this.options.outputDir = args[++i];
          }
          break;
        case '--collections':
        case '-c':
          if (i + 1 < args.length) {
            this.options.collections = args[++i].split(',');
          }
          break;
        case '--force_overwrite':
        case '-f':
          this.options.forceOverwrite = true;
          break;
        case '--force_png':
        case '-p':
          this.options.forcePng = true;
          break;
        case '--force-no-safe':
        case '-s':
          this.options.forceNoSafe = true;
          break;
        case '--help':
        case '-h':
          this.showHelp();
          process.exit(0);
          break;
      }
    }
  }

  private showHelp(): void {
    console.log(`
RocketCards Image Export CLI
============================

Downloads card images from pollinations.ai to local files.

Usage: node image-export-cli.js [options]

Options:
  -d, --delay <ms>        Delay between image downloads (default: 1000ms)
  -r, --retries <count>   Number of retry attempts per image (default: 3)
  -o, --output <dir>      Output directory for images (default: public/images/cards)
  -c, --collections <list> Comma-separated list of collections to export (default: all)
  -f, --force_overwrite   Force overwrite existing local images (default: false)
  -p, --force_png         Request PNG images instead of WEBP (default: false)
  -s, --force-no-safe     Remove safe=true parameter from requests (default: false)
  -h, --help             Show this help message

Examples:
  node image-export-cli.js
  node image-export-cli.js --delay 2000 --retries 5
  node image-export-cli.js --collections fantasy,monsters
  node image-export-cli.js --output ./my-images --delay 500
  node image-export-cli.js --force_overwrite --force_png
  node image-export-cli.js --force-no-safe
    `);
  }

  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.options.outputDir, { recursive: true });
      console.log(`✓ Output directory ready: ${this.options.outputDir}`);
    } catch (error) {
      console.error(`✗ Failed to create output directory: ${error}`);
      process.exit(1);
    }
  }

  private async loadCollection(collectionId: string): Promise<Collection | null> {
    try {
      const collectionPath = path.join(__dirname, `../../data/${collectionId}.json`);
      const collectionData = await fs.readFile(collectionPath, 'utf-8');
      return JSON.parse(collectionData);
    } catch (error) {
      console.error(`✗ Failed to load collection ${collectionId}: ${error}`);
      return null;
    }
  }

  private async downloadImage(url: string, retries: number = this.options.retries): Promise<ArrayBuffer | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`  Attempt ${attempt}/${retries}...`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.arrayBuffer();
      } catch (error) {
        console.error(`    Failed attempt ${attempt}: ${error}`);
        if (attempt < retries) {
          console.log(`    Retrying in 1 second...`);
          await this.delay(1000);
        }
      }
    }
    
    return null;
  }

  private async fileExists(filepath: string): Promise<boolean> {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  private async saveImage(buffer: ArrayBuffer, filename: string): Promise<boolean> {
    try {
      const filepath = path.join(this.options.outputDir, filename);
      
      // Check if file exists and force_overwrite is false
      if (!this.options.forceOverwrite && await this.fileExists(filepath)) {
        console.log(`  ⏭️  Skipping (exists): ${filename}`);
        return true;
      }
      
      await fs.writeFile(filepath, Buffer.from(buffer));
      return true;
    } catch (error) {
      console.error(`✗ Failed to save image ${filename}: ${error}`);
      return false;
    }
  }

  private async exportCardImage(card: Card): Promise<boolean> {
    try {
      const description = card.imageDescription || card.description || card.title;
      const extension = this.options.forcePng ? '.png' : '.webp';
      const contentType = this.options.forcePng ? 'image/png' : 'image/webp';
      
      let baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(description)}?width=256&height=256&nologo=true&private=true`;
      if (!this.options.forceNoSafe) {
        baseUrl += '&safe=true';
      }
      baseUrl += '&seed=1';
      
      let imageUrl = baseUrl;
      if (this.options.forcePng) {
        imageUrl += '&contentType=image/png';
      }
      
      console.log(`Downloading image for card: ${card.id}`);
      console.log(`  URL: ${imageUrl}`);
      
      const imageBuffer = await this.downloadImage(imageUrl);
      
      if (imageBuffer) {
        const filename = `${card.id}${extension}`;
        const success = await this.saveImage(imageBuffer, filename);
        
        if (success) {
          console.log(`  ✓ Saved: ${filename}`);
          return true;
        } else {
          console.error(`  ✗ Failed to save: ${filename}`);
          return false;
        }
      } else {
        console.error(`  ✗ Failed to download image for ${card.id}`);
        return false;
      }
    } catch (error) {
      console.error(`  ✗ Error exporting card ${card.id}: ${error}`);
      return false;
    }
  }

  private async exportCollectionImage(collection: Collection): Promise<boolean> {
    try {
      const extension = this.options.forcePng ? '.png' : '.webp';
      const collectionImageId = collection.id;
      const filename = `${collectionImageId}${extension}`;
      const filepath = path.join(this.options.outputDir, filename);
      
      // Check if file exists and force_overwrite is false
      if (!this.options.forceOverwrite && await this.fileExists(filepath)) {
        console.log(`⏭️  Skipping collection image (exists): ${filename}`);
        return true;
      }
      
      let baseUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(collection.description)}?width=128&height=128&nologo=true&private=true`;
      if (!this.options.forceNoSafe) {
        baseUrl += '&safe=true';
      }
      baseUrl += '&seed=1';
      
      let imageUrl = baseUrl;
      if (this.options.forcePng) {
        imageUrl += '&contentType=image/png';
      }
      
      console.log(`\nDownloading collection image: ${collection.id}`);
      console.log(`  URL: ${imageUrl}`);
      
      const imageBuffer = await this.downloadImage(imageUrl);
      
      if (imageBuffer) {
        const success = await this.saveImage(imageBuffer, filename);
        
        if (success) {
          console.log(`  ✓ Saved collection image: ${filename}`);
          return true;
        } else {
          console.error(`  ✗ Failed to save collection image: ${filename}`);
          return false;
        }
      } else {
        console.error(`  ✗ Failed to download collection image for ${collection.id}`);
        return false;
      }
    } catch (error) {
      console.error(`  ✗ Error exporting collection image ${collection.id}: ${error}`);
      return false;
    }
  }

  private async exportCollection(collectionId: string): Promise<{ success: number; failed: number }> {
    console.log(`\nExporting collection: ${collectionId}`);
    console.log(`=`.repeat(40));
    
    const collection = await this.loadCollection(collectionId);
    
    if (!collection) {
      console.error(`✗ Collection ${collectionId} not found`);
      return { success: 0, failed: 0 };
    }
    
    // Export collection image first
    const collectionImageSuccess = await this.exportCollectionImage(collection);
    console.log('');
    
    let successCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < collection.cards.length; i++) {
      const card = collection.cards[i];
      console.log(`[${i + 1}/${collection.cards.length}] Processing card: ${card.id}`);
      
      const success = await this.exportCardImage(card);
      
      if (success) {
        successCount++;
      } else {
        failedCount++;
      }
      
      // Delay between downloads to avoid rate limiting
      if (i < collection.cards.length - 1) {
        console.log(`  Waiting ${this.options.delay}ms before next download...`);
        await this.delay(this.options.delay);
      }
    }
    
    console.log(`\nCollection ${collectionId} summary:`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed:  ${failedCount}`);
    console.log(`  Total:   ${successCount + failedCount}`);
    
    return { success: successCount, failed: failedCount };
  }

  public async run(): Promise<void> {
    await this.parseArguments();
    
    console.log('🚀 RocketCards Image Export CLI');
    console.log('================================');
    console.log(`Delay: ${this.options.delay}ms`);
    console.log(`Retries: ${this.options.retries}`);
    console.log(`Output: ${this.options.outputDir}`);
    console.log(`Collections: ${this.options.collections.join(', ')}`);
    console.log(`Force Overwrite: ${this.options.forceOverwrite ? 'Yes' : 'No'}`);
    console.log(`Force PNG: ${this.options.forcePng ? 'Yes' : 'No'}`);
    console.log(`Force No Safe: ${this.options.forceNoSafe ? 'Yes' : 'No'}`);
    console.log('');
    
    await this.ensureOutputDirectory();
    
    const results: Record<string, { success: number; failed: number }> = {};
    
    for (const collectionId of this.options.collections) {
      const result = await this.exportCollection(collectionId);
      results[collectionId] = result;
    }
    
    // Print final summary
    console.log('\n🎉 Export Complete!');
    console.log('====================');
    
    let totalSuccess = 0;
    let totalFailed = 0;
    
    for (const [collectionId, result] of Object.entries(results)) {
      console.log(`${collectionId}: ${result.success} success, ${result.failed} failed`);
      totalSuccess += result.success;
      totalFailed += result.failed;
    }
    
    console.log(`\n📊 Overall Summary:`);
    console.log(`  Total Success: ${totalSuccess}`);
    console.log(`  Total Failed:  ${totalFailed}`);
    console.log(`  Total Cards:   ${totalSuccess + totalFailed}`);
    
    if (totalFailed > 0) {
      console.log(`\n⚠️  ${totalFailed} cards failed to export. Check the errors above.`);
    }
    
    console.log(`\n📁 Images saved to: ${this.options.outputDir}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new ImageExportCLI();
  cli.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default ImageExportCLI;