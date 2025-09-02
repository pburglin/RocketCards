// Admin Image Export Component
// Provides UI for exporting card images to local files

import { useState } from 'react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Download, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { imageExportService } from '../lib/imageExportService'
import { useGameStore } from '../store/gameStore'

export default function AdminImageExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<{ collection: string; progress: number; total: number } | null>(null)
  const [exportResults, setExportResults] = useState<Record<string, { success: number; failed: number }> | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<string>('all')
  const { collections } = useGameStore()

  const handleExportAll = async () => {
    setIsExporting(true)
    setExportProgress(null)
    setExportResults(null)
    
    try {
      const results = await imageExportService.exportAllCollections((collection, progress, total) => {
        setExportProgress({ collection, progress, total })
      })
      
      setExportResults(results)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  const handleExportCollection = async (collectionId: string) => {
    setIsExporting(true)
    setExportProgress(null)
    setExportResults(null)
    
    try {
      const result = await imageExportService.exportCollectionImages(collectionId, (progress, total) => {
        setExportProgress({ collection: collectionId, progress, total })
      })
      
      setExportResults({ [collectionId]: result })
    } catch (error) {
      console.error(`Export failed for collection ${collectionId}:`, error)
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  const handleDownloadCollection = async (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId)
    if (!collection) return

    setIsExporting(true)
    
    try {
      // Download each card image individually
      for (const card of collection.cards) {
        await imageExportService.downloadCardImage(card.id, card.description, card.title)
        // Small delay to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error(`Download failed for collection ${collectionId}:`, error)
    } finally {
      setIsExporting(false)
    }
  }

  const collectionOptions = [
    { id: 'all', name: 'All Collections' },
    ...collections.map(collection => ({
      id: collection.id,
      name: collection.name
    }))
  ]

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Image Export</h2>
          <p className="text-text-secondary mt-1">
            Export card images for offline use and reduced API calls
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="px-3 py-2 bg-surface-light border border-border rounded-lg text-text"
            disabled={isExporting}
          >
            {collectionOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          
          <Button
            onClick={() => selectedCollection === 'all' 
              ? handleExportAll() 
              : handleExportCollection(selectedCollection)}
            disabled={isExporting}
            className="flex items-center"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : 'Export Images'}
          </Button>
          
          <Button
            onClick={() => selectedCollection === 'all' 
              ? handleExportAll() 
              : handleDownloadCollection(selectedCollection)}
            variant="outline"
            disabled={isExporting}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download ZIP
          </Button>
        </div>
      </div>

      {exportProgress && (
        <div className="mb-6 p-4 bg-surface-light rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Exporting {exportProgress.collection}...
            </span>
            <span className="text-sm text-text-secondary">
              {exportProgress.progress} / {exportProgress.total}
            </span>
          </div>
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(exportProgress.progress / exportProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {exportResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(exportResults).map(([collectionId, result]) => {
            const collection = collections.find(c => c.id === collectionId)
            return (
              <Card key={collectionId} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">
                    {collection?.name || collectionId}
                  </h3>
                  <div className="flex items-center">
                    {result.success > 0 && (
                      <span className="flex items-center text-green-500 text-sm mr-2">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {result.success}
                      </span>
                    )}
                    {result.failed > 0 && (
                      <span className="flex items-center text-red-500 text-sm">
                        <XCircle className="w-4 h-4 mr-1" />
                        {result.failed}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-text-secondary">
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <span className="text-green-500">{result.success}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="text-red-500">{result.failed}</span>
                  </div>
                  <div className="flex justify-between font-medium mt-1 pt-1 border-t border-border">
                    <span>Total:</span>
                    <span>{result.success + result.failed}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-surface-light rounded-lg">
        <h3 className="font-semibold mb-2">How to Use</h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• Select a collection and click "Export Images" to process all card images</li>
          <li>• Use "Download ZIP" to download images as individual files</li>
          <li>• Exported images will be saved with card IDs as filenames</li>
          <li>• Place exported images in the /public/images/cards/ directory for local loading</li>
        </ul>
      </div>
    </Card>
  )
}