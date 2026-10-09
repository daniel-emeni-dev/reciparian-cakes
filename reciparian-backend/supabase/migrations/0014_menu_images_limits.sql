update storage.buckets
set file_size_limit = 3145728,
    allowed_mime_types = array['image/webp']
where id = 'menu-images';