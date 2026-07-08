import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      {" "}
      <span className="text-xs uppercase tracking-[0.3em] text-neutral-500">
        Error 404
      </span>{" "}
      <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tight text-foreground">
        {" "}
        Not Found{" "}
      </h1>{" "}
      <p className="text-neutral-500 text-sm max-w-md leading-relaxed">
        {" "}
        The page you are looking for does not exist or has been moved.{" "}
      </p>{" "}
      <Link
        href="/"
        className="border border-accent/30 px-8 py-3 text-xs uppercase tracking-widest text-accent transition-all duration-300 hover:bg-accent hover:text-background"
      >
        {" "}
        Return Home{" "}
      </Link>{" "}
    </main>
  );
}
