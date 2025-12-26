export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Recruitment System</h3>
            <p className="text-neutral-400 text-sm">
              Connecting talented professionals with great opportunities. 
              Your career journey starts here.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/jobs" className="text-neutral-400 hover:text-white transition-colors">
                  Browse Jobs
                </a>
              </li>
              <li>
                <a href="/about" className="text-neutral-400 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-neutral-400 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>Email: support@recruitment.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Business Ave, Suite 100</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 mt-8 pt-6 text-center">
          <p className="text-neutral-400 text-sm">
            © {currentYear} Recruitment Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
