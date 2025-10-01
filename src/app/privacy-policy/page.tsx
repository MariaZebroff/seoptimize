import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - SEO Optimize",
  description: "Privacy Policy for SEO Optimize - How we collect, use, and protect your data",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                SEO Optimize ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our SEO analysis and optimization service.
              </p>
              <p className="text-gray-700 mb-4">
                By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">We collect personal information that you provide directly to us:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                <li><strong>Profile Information:</strong> Company name, website URL, preferences</li>
                <li><strong>Payment Information:</strong> Billing address, payment method (processed securely by Stripe)</li>
                <li><strong>Communication Data:</strong> Messages, support requests, feedback</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Website Analysis Data</h3>
              <p className="text-gray-700 mb-4">When you use our SEO analysis features, we collect:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Website URLs:</strong> URLs of websites you analyze</li>
                <li><strong>Audit Results:</strong> Performance scores, SEO metrics, accessibility data</li>
                <li><strong>Content Analysis:</strong> Page titles, meta descriptions, headings, images</li>
                <li><strong>Technical Data:</strong> Page load times, broken links, mobile scores</li>
                <li><strong>Usage Patterns:</strong> Frequency of audits, features used, time spent</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Technical Information</h3>
              <p className="text-gray-700 mb-4">We automatically collect certain technical information:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
                <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics</li>
                <li><strong>Log Data:</strong> Server logs, error reports, performance metrics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the collected information for the following purposes:</p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Service Provision</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide SEO analysis and optimization recommendations</li>
                <li>Generate audit reports and performance insights</li>
                <li>Enable AI-powered content suggestions and keyword research</li>
                <li>Maintain your account and subscription</li>
                <li>Process payments and manage billing</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Communication</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Send service-related notifications and updates</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Provide customer service and technical support</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Service Improvement</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Analyze usage patterns to improve our service</li>
                <li>Develop new features and functionality</li>
                <li>Conduct research and analytics</li>
                <li>Monitor and prevent fraud and abuse</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">We do not sell, trade, or rent your personal information. We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Service Providers</h3>
              <p className="text-gray-700 mb-4">We share information with trusted third-party service providers:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Google:</strong> PageSpeed Insights API, Analytics</li>
                <li><strong>OpenAI:</strong> AI-powered content generation</li>
                <li><strong>Vercel/Deployment Platform:</strong> Hosting and infrastructure</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">We may disclose information when required by law or to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Comply with legal obligations or court orders</li>
                <li>Protect our rights, property, or safety</li>
                <li>Prevent fraud or abuse</li>
                <li>Protect the rights and safety of our users</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Business Transfers</h3>
              <p className="text-gray-700 mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">We implement appropriate security measures to protect your information:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Encryption:</strong> Data encrypted in transit and at rest</li>
                <li><strong>Access Controls:</strong> Limited access to personal information</li>
                <li><strong>Secure Infrastructure:</strong> Industry-standard security practices</li>
                <li><strong>Regular Audits:</strong> Security assessments and monitoring</li>
                <li><strong>Data Backup:</strong> Regular backups with secure storage</li>
              </ul>
              <p className="text-gray-700 mb-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">We retain your information for as long as necessary to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve our services</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Audit Data:</strong> We automatically delete audit results older than 30 days to optimize performance and reduce storage costs. You can export your audit data before deletion.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Account Data:</strong> We retain account information until you delete your account or request deletion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">Depending on your location, you may have the following rights:</p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Access and Portability</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Access your personal information</li>
                <li>Request a copy of your data</li>
                <li>Export your audit data and reports</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Correction and Updates</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Update your account information</li>
                <li>Correct inaccurate data</li>
                <li>Modify your preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Deletion</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Delete your account</li>
                <li>Request deletion of specific data</li>
                <li>Remove your information from our systems</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.4 Communication Preferences</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Opt out of marketing emails</li>
                <li>Manage notification preferences</li>
                <li>Unsubscribe from communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Provide personalized experiences</li>
                <li>Track performance and security</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">Our service integrates with third-party services that have their own privacy policies:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Google PageSpeed Insights:</strong> For website performance analysis</li>
                <li><strong>Google Analytics:</strong> For usage analytics and insights</li>
                <li><strong>Stripe:</strong> For payment processing</li>
                <li><strong>OpenAI:</strong> For AI-powered content generation</li>
                <li><strong>Supabase:</strong> For database and authentication services</li>
              </ul>
              <p className="text-gray-700 mb-4">
                We encourage you to review the privacy policies of these third-party services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Standard contractual clauses</li>
                <li>Adequacy decisions</li>
                <li>Certification schemes</li>
                <li>Other appropriate safeguards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Posting the updated policy on our website</li>
                <li>Sending an email notification</li>
                <li>Displaying a notice in our service</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Your continued use of our service after changes become effective constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@seoptimize.com<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Phone:</strong> [Your Phone Number]<br />
                  <strong>Data Protection Officer:</strong> dpo@seoptimize.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Regional Privacy Rights</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">14.1 European Union (GDPR)</h3>
              <p className="text-gray-700 mb-4">
                If you are in the EU, you have additional rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Right to access, rectification, and erasure</li>
                <li>Right to restrict processing and data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">14.2 California (CCPA)</h3>
              <p className="text-gray-700 mb-4">
                If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Right to know what personal information is collected</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to non-discrimination for exercising privacy rights</li>
              </ul>
            </section>

            <div className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-500">
                This Privacy Policy is effective as of the date listed above and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
