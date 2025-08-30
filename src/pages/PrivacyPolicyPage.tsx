import { Shield } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        
        <div className="card p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <p className="mb-6">
              RocketCards ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our card game platform and related services.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
            <p className="mb-4">We may collect personally identifiable information that you voluntarily provide, including:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Account registration information (username, email address)</li>
              <li>Profile information (display name, avatar, game preferences)</li>
              <li>Communication data (messages, feedback, support requests)</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3">Game Data</h3>
            <p className="mb-4">We collect information related to your gameplay:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Deck configurations and card selections</li>
              <li>Match history and game statistics</li>
              <li>Strategic choices and gameplay patterns</li>
              <li>Collection preferences and card acquisitions</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3">Technical Information</h3>
            <p className="mb-4">We automatically collect technical information about your device and usage:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Device information (browser type, operating system, device identifiers)</li>
              <li>Network information (IP address, connection speed)</li>
              <li>Usage data (pages visited, features used, session duration)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for various purposes:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>To provide, maintain, and improve our services</li>
              <li>To personalize your gaming experience</li>
              <li>To process transactions and manage accounts</li>
              <li>To communicate with you about updates and support</li>
              <li>To analyze usage patterns and optimize performance</li>
              <li>To detect and prevent fraudulent or unauthorized activities</li>
              <li>To comply with legal obligations</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Information Sharing and Disclosure</h2>
            <p className="mb-4">We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our services</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Data Security</h2>
            <p className="mb-6">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Data Retention</h2>
            <p className="mb-6">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of your data</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Withdrawal of consent</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Children's Privacy</h2>
            <p className="mb-6">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Changes to This Privacy Policy</h2>
            <p className="mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Contact Us</h2>
            <p className="mb-6">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <strong>Email:</strong> privacy@rocketcards.com
              <br />
              <strong>Address:</strong> RocketCards Legal Department, 123 Game Street, Digital City, DC 12345
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}