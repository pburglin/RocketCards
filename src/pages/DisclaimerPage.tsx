import { AlertTriangle } from 'lucide-react'

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Disclaimer</h1>
        </div>
        
        <div className="card p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <p className="mb-6">
              This Disclaimer ("Disclaimer") applies to your access to and use of the CardWizard website and related services. Please read this Disclaimer carefully before using our services.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">No Professional Advice</h2>
            <p className="mb-6">
              The information provided through CardWizard is for general entertainment purposes only and should not be construed as professional advice of any kind. We are not liable for any decisions made based on the information provided.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">No Warranty</h2>
            <p className="mb-6">
              CARDWIZARD IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Limitation of Liability</h2>
            <p className="mb-6">
              IN NO EVENT SHALL CARDWIZARD, ITS AFFILIATES, OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF OR INABILITY TO USE OUR SERVICES.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Third-Party Content</h2>
            <p className="mb-6">
              CardWizard may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">User-Generated Content</h2>
            <p className="mb-6">
              CardWizard may allow users to generate, submit, or share content. We are not responsible for the accuracy, completeness, or usefulness of any user-generated content. All user-generated content is the sole responsibility of the person who originated such content.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Virtual Items and Currency</h2>
            <p className="mb-6">
              Virtual items, currency, and other digital content available through CardWizard have no real-world value and are not redeemable for real money or goods. We reserve the right to modify, suspend, or terminate virtual items at any time without notice or liability.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Intellectual Property</h2>
            <p className="mb-6">
              All content, trademarks, and other intellectual property rights in CardWizard are owned by us or our licensors. Nothing in this Disclaimer grants you any right to use any trademark, logo, or other proprietary material.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Gaming and Gambling</h2>
            <p className="mb-6">
              CardWizard is a strategic card game platform and does not involve real money gambling. Any similarity to gambling activities is purely coincidental. Users should not treat virtual gameplay as equivalent to real gambling.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Accuracy of Information</h2>
            <p className="mb-6">
              While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained in CardWizard.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Changes to Services</h2>
            <p className="mb-6">
              We reserve the right to modify, suspend, or discontinue, temporarily or permanently, any features or portions of CardWizard with or without notice. We shall not be liable for any modification, suspension, or discontinuance of the service.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Governing Law</h2>
            <p className="mb-6">
              This Disclaimer shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Severability</h2>
            <p className="mb-6">
              If any provision of this Disclaimer is held to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Entire Agreement</h2>
            <p className="mb-6">
              This Disclaimer, together with our Terms of Service and Privacy Policy, constitutes the entire agreement between you and CardWizard regarding your use of our services.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Sound Effects Attribution</h2>
            <p className="mb-6">
              Sound effects provided by Mixkit. Visit <a href="https://mixkit.co/free-sound-effects/game/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://mixkit.co/free-sound-effects/game/</a> for more free game sound effects.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Contact Us</h2>
            <p className="mb-6">
              If you have any questions about this Disclaimer, please contact us at:
              <br />
              <strong>Email:</strong> legal@cardwizard.com
              <br />
              <strong>Address:</strong> CardWizard Legal Department, 123 Game Street, Digital City, DC 12345
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}