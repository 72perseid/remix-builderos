-- Create has_role helper function for RLS policies
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop the overly permissive ALL policy on products
DROP POLICY IF EXISTS "Allow authenticated updates to products" ON public.products;

-- Keep the existing SELECT policy (authenticated users can view products)
-- Add admin-only write policies
CREATE POLICY "Only admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));