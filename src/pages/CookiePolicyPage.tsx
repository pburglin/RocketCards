import { Cookie } from 'lucide-react'

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
            <Cookie className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
        </div>
        
        <div className="card p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <p className="mb-6">
              This Cookie Policy explains how RocketCards ("we," "our," or "us") uses cookies and similar tracking technologies when you visit our website and use our services.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">What Are Cookies?</h2>
            <p className="mb-6">
              Cookies are small text files that are stored on your device when you visit websites. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold mb-3">Essential Cookies</h3>
            <p className="mb-4">These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services.</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Authentication cookies (to keep you signed in)</li>
              <li>Security cookies (to prevent fraudulent use)</li>
              <li>Load balancing cookies (to ensure sites function smoothly)</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3">Performance Cookies</h3>
            <p className="mb-4">These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Analytics cookies (Google Analytics, etc.)</li>
              <li>Performance monitoring cookies</li>
              <li>Error tracking cookies</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3">Functionality Cookies</h3>
            <p className="mb-4">These cookies enable the website to provide enhanced functionality and personalization.</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Preference cookies (language, region, theme)</li>
              <li>Social media cookies</li>
              <li>Content personalization cookies</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3">Targeting Cookies</h3>
            <p className="mb-6">These cookies may be set through our site by our advertising partners to build a profile of your interests.</p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Third-Party Cookies</h2>
            <p className="mb-6">
              We may also use third-party cookies for analytics, advertising, and social media integration. These cookies are subject to the respective privacy policies of these third parties.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">How to Control Cookies</h2>
            <p className="mb-4">You can control and/or delete cookies as you wish. You can:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Delete all cookies that are already on your device</li>
              <li>Set your browser to block cookies</li>
              <li>Receive alerts when cookies are being set</li>
            </ul>
            <p className="mb-6">
              If you choose to delete cookies, you may need to re-enter information when you visit our site. Blocking cookies may prevent you from taking full advantage of our website.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Do Not Track</h2>
            <p className="mb-6">
              Some browsers have a "Do Not Track" feature that lets you tell websites that you do not want to have your online activities tracked. We do not currently respond to browser "Do Not Track" signals.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Changes to This Cookie Policy</h2>
            <p className="mb-6">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
            
            <h2 className="text-2xl font-bold mb-4 mt-8">Contact Us</h2>
            <p className="mb-6">
              If you have any questions about this Cookie Policy, please contact us at:
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