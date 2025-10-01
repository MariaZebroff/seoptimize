import Link from 'next/link';
import { hasAnyConsent } from '@/lib/cookieConsent';

export default function Footer() {
  const showCookieManagement = hasAnyConsent();
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors mb-4 block">
              SEO Optimize
            </Link>
            <p className="text-gray-400">
              Detailed page-by-page SEO analysis for better search rankings.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/audit" className="hover:text-white transition-colors">Page Audit</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              <li><a href="mailto:support@seoptimize.com" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400">
            <p>&copy; 2024 SEO Optimize. All rights reserved.</p>
            {showCookieManagement && (
              <button
                onClick={() => {
                  localStorage.removeItem('cookie-consent');
                  window.location.reload();
                }}
                className="mt-2 sm:mt-0 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Manage Cookies
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
