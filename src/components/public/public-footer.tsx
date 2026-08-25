import Link from "next/link";
import { MediSyncBrand } from "@/components/branding/medisync-brand";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6">
            <MediSyncBrand />
            <p className="text-sm leading-6 text-slate-600 max-w-xs">
              MediSync connects Patients, verified Doctors and Pharmacists through one secure digital healthcare workflow.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-slate-950">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/features" className="text-sm leading-6 text-slate-600 hover:text-slate-950">Features</Link>
                  </li>
                  <li>
                    <Link href="/guides" className="text-sm leading-6 text-slate-600 hover:text-slate-950">Guides</Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-slate-950">Company / Info</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/about" className="text-sm leading-6 text-slate-600 hover:text-slate-950">About</Link>
                  </li>
                  <li>
                    <Link href="/#faq" className="text-sm leading-6 text-slate-600 hover:text-slate-950">FAQ</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-slate-950">Account</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/login" className="text-sm leading-6 text-slate-600 hover:text-slate-950">Sign In</Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-sm leading-6 text-slate-600 hover:text-slate-950">Get Started</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-slate-900/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-slate-500">
            &copy; {new Date().getFullYear()} MediSync.
          </p>
        </div>
      </div>
    </footer>
  );
}
