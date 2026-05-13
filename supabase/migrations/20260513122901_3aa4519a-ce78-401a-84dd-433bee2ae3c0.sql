UPDATE public.products
SET programs_duration_days = 0
WHERE product_name = 'Free';

UPDATE public.enrollments e
SET programs_expires_at = NULL
FROM public.products p
WHERE e.product_id = p.id
  AND p.product_name = 'Free';

UPDATE public.enrollments SET updated_at = now();