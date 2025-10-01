import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - SEO Optimize",
  description: "Terms of Service for SEO Optimize - SEO analysis and optimization tool",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using SEO Optimize ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                SEO Optimize is a web-based SEO analysis and optimization tool that provides:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Website performance analysis using Google PageSpeed Insights</li>
                <li>SEO audit and recommendations</li>
                <li>Accessibility and best practices analysis</li>
                <li>AI-powered content suggestions and keyword research</li>
                <li>Broken link detection</li>
                <li>Audit history and reporting</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <p className="text-gray-700 mb-4">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription Plans and Billing</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Subscription Tiers</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Free Tier:</strong> 1 page audit every 3 days, 1 site with 1 page</li>
                <li><strong>Basic Plan:</strong> $9.99/month - 2 audits per page per day, 1 site with up to 3 pages</li>
                <li><strong>Pro Plan:</strong> $49.99/month - Unlimited audits, up to 5 sites with unlimited pages, AI features</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Billing and Payment</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Subscriptions are billed monthly in advance</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We use Stripe for secure payment processing</li>
                <li>You authorize us to charge your payment method for all fees</li>
                <li>Prices may change with 30 days notice to existing subscribers</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Cancellation and Refunds</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You may cancel your subscription at any time</li>
                <li>Cancellation takes effect at the end of your current billing period</li>
                <li>No refunds for partial months or unused features</li>
                <li>Refunds may be provided at our sole discretion for technical issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
              <p className="text-gray-700 mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malicious code, viruses, or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the Service for competitive analysis of our platform</li>
                <li>Resell or redistribute the Service without permission</li>
                <li>Overload or disrupt our servers or networks</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The Service and its original content, features, and functionality are owned by SEO Optimize and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-gray-700 mb-4">
                You retain ownership of your website content and data. By using our Service, you grant us a limited license to analyze your content for the purpose of providing SEO recommendations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>We collect and process data as described in our Privacy Policy</li>
                <li>We implement appropriate security measures to protect your data</li>
                <li>We comply with applicable data protection laws</li>
                <li>You have rights regarding your personal data as outlined in our Privacy Policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability and Modifications</h2>
              <p className="text-gray-700 mb-4">
                We strive to maintain high service availability but cannot guarantee uninterrupted access. We may:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Modify, suspend, or discontinue the Service with notice</li>
                <li>Perform maintenance that may temporarily affect availability</li>
                <li>Update features and functionality</li>
                <li>Change pricing with 30 days notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, SEO Optimize shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
              <p className="text-gray-700 mb-4">
                Our total liability to you for any damages shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to defend, indemnify, and hold harmless SEO Optimize and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Your right to use the Service will cease immediately</li>
                <li>We may delete your account and data</li>
                <li>Provisions that by their nature should survive termination shall remain in effect</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@seoptimize.com<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Phone:</strong> [Your Phone Number]
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Severability</h2>
              <p className="text-gray-700 mb-4">
                If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <div className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-500">
                By using SEO Optimize, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
