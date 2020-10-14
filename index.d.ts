export default function matches(
  matcher: Record<
    string,
    RegExp | number | string | boolean | ((value: any) => boolean)
  >
): (object: unknown) => boolean
