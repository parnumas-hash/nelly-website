import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-8xl font-bold text-primary">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold md:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-neutral-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button size="lg">Return Home</Button>
      </Link>
    </div>
  );
}
