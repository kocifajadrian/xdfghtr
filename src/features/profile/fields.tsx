import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** A label, an input and below it the error or a hint. */
export function TextField({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: { id: string; label: string; error?: string | null; hint?: string } & React.ComponentProps<'input'>) {
  return (
    <div className={cn('grid content-start gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={!!error} {...props} />
      {error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : (
        hint && <p className="text-muted-foreground text-sm">{hint}</p>
      )}
    </div>
  )
}
