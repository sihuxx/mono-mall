export default function Footer() {
  return (
    <footer className="border-t border-neutral-100 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="text-lg tracking-[0.2em] font-light mb-2">
              MONO<span className="font-medium">.</span>
            </div>
            <p className="text-xs text-neutral-500 tracking-wider">MINIMAL FASHION STORE</p>
          </div>
          <div className="text-xs text-neutral-400 tracking-wider">
            © 2025 MONO. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </footer>
  );
}
