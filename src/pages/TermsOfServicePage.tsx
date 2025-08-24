import { FileText } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
        
        <div className="card p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <p className="mb-6">
              Welcome to CardWizard! These Terms of Service ("Terms") govern your access to and use of our card game platform and related services. By accessing or using CardWizard, you agree to be bound by these Terms.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">1. Acceptance of Terms</h2>
            <p className="mb-6">
              By creating an account, accessing, or using CardWizard, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use our services.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">2. Eligibility</h2>
            <p className="mb-6">
              You must be at least 13 years old to use CardWizard. If you are under 18, you represent that you have your parent or guardian's permission to use our services. By using CardWizard, you represent and warrant that you meet these requirements.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">3. Account Registration</h2>
            <p className="mb-4">When creating an account, you agree to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password</li>
              <li>Accept all risks of unauthorized access to your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">4. User Conduct</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Use CardWizard for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the services</li>
              <li>Use bots, scripts, or automated processes</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Modify, adapt, or hack the service</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">5. Intellectual Property</h2>
            <p className="mb-6">
              CardWizard and all related content, including but not limited to text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, are the property of CardWizard or its licensors and are protected by international copyright laws.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">6. User Content</h2>
            <p className="mb-4">You retain ownership of content you create, but you grant us:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>A worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content</li>
              <li>The right to modify or adapt your content for technical purposes</li>
              <li>The right to remove your content at any time for any reason</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">7. Virtual Items and Currency</h2>
            <p className="mb-6">
              CardWizard may offer virtual items, currency, or other digital content for purchase or acquisition. You acknowledge that:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Virtual items have no real-world value</li>
              <li>We may modify, suspend, or terminate virtual items at any time</li>
              <li>You may not sell, trade, or transfer virtual items outside the platform</li>
              <li>We are not liable for loss of virtual items due to technical issues</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">8. Payments and Subscriptions</h2>
            <p className="mb-6">
              If you purchase premium features or virtual items, you agree to pay all applicable fees. All payments are non-refundable unless required by law. We may change prices at any time with notice to you.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">9. Disclaimers and Limitations of Liability</h2>
            <p className="mb-6">
              CARDWIZARD IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">10. Indemnification</h2>
            <p className="mb-6">
              You agree to indemnify and hold harmless CardWizard and its affiliates from any claims, damages, losses, liabilities, costs, and expenses arising from your use of our services or violation of these Terms.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">11. Termination</h2>
            <p className="mb-6">
              We may terminate or suspend your account and access to CardWizard at any time, with or without cause, with or without notice. Upon termination, your right to use the service will immediately cease.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">12. Governing Law</h2>
            <p className="mb-6">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">13. Changes to Terms</h2>
            <p className="mb-6">
              We reserve the right to modify these Terms at any time. We will notify you of significant changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of CardWizard after such changes constitutes acceptance.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">14. Contact Information</h2>
            <p className="mb-6">
              If you have any questions about these Terms, please contact us at:
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