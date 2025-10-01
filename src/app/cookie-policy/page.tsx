import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - SEO Optimize",
  description: "Cookie Policy for SEO Optimize - How we use cookies and tracking technologies",
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
              <p className="text-gray-700 mb-4">We use cookies for the following purposes:</p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Essential Cookies</h3>
              <p className="text-gray-700 mb-4">These cookies are necessary for the website to function properly:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Authentication and session management</li>
                <li>Security and fraud prevention</li>
                <li>Load balancing and performance</li>
                <li>User preferences and settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Analytics Cookies</h3>
              <p className="text-gray-700 mb-4">We use Google Analytics to understand how visitors interact with our website:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Page views and user behavior</li>
                <li>Traffic sources and referrals</li>
                <li>User demographics and interests</li>
                <li>Performance and optimization insights</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Functional Cookies</h3>
              <p className="text-gray-700 mb-4">These cookies enhance your experience on our website:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Remember your login status</li>
                <li>Save your preferences and settings</li>
                <li>Provide personalized content</li>
                <li>Improve website functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">We use third-party services that may set their own cookies:</p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Google Analytics</h3>
              <p className="text-gray-700 mb-4">
                We use Google Analytics to analyze website usage. Google Analytics uses cookies to collect information about how visitors use our site.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Purpose:</strong> Website analytics and performance monitoring</li>
                <li><strong>Data collected:</strong> IP address, browser type, pages visited, time spent</li>
                <li><strong>Retention:</strong> Up to 26 months</li>
                <li><strong>Opt-out:</strong> <a href="https://tools.google.com/dlpage/gaoptout" className="text-indigo-600 hover:text-indigo-500">Google Analytics Opt-out</a></li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Stripe</h3>
              <p className="text-gray-700 mb-4">
                We use Stripe for payment processing, which may set cookies for security and fraud prevention.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Supabase</h3>
              <p className="text-gray-700 mb-4">
                We use Supabase for authentication and database services, which may set cookies for session management.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookie Categories</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Essential</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Authentication, security, functionality</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Session/1 year</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Analytics</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Website usage analysis</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Up to 26 months</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Functional</td>
                      <td className="px-6 py-4 text-sm text-gray-500">User preferences, personalization</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1-2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Managing Cookies</h2>
              <p className="text-gray-700 mb-4">You can control and manage cookies in several ways:</p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Browser Settings</h3>
              <p className="text-gray-700 mb-4">Most web browsers allow you to control cookies through their settings:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Opt-Out Options</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" className="text-indigo-600 hover:text-indigo-500">Opt-out browser add-on</a></li>
                <li><strong>AdChoices:</strong> <a href="http://www.aboutads.info/choices/" className="text-indigo-600 hover:text-indigo-500">Digital Advertising Alliance</a></li>
                <li><strong>Your Online Choices:</strong> <a href="http://www.youronlinechoices.eu/" className="text-indigo-600 hover:text-indigo-500">European Interactive Digital Advertising Alliance</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Impact of Disabling Cookies</h2>
              <p className="text-gray-700 mb-4">
                If you choose to disable cookies, some features of our website may not function properly:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You may not be able to stay logged in</li>
                <li>Your preferences and settings may not be saved</li>
                <li>Some features may not work as expected</li>
                <li>We may not be able to provide personalized content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@seoptimize.com<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Phone:</strong> [Your Phone Number]
                </p>
              </div>
            </section>

            <div className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-500">
                This Cookie Policy is effective as of the date listed above and will remain in effect except with respect to any changes in its provisions in the future.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
