import { useEffect, useMemo, useState } from 'react';

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

function getInitials(user) {
  const source = String(user?.name || user?.email || 'U').trim();

  if (!source) return 'U';

  return (
    source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U'
  );
}

export default function Avatar({
  user,
  size = 'md',
  className = '',
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const photoUrl =
    user?.profile_photo_url ||
    user?.avatar_url ||
    '';

  const initials = useMemo(() => getInitials(user), [user]);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  if (photoUrl && !imageFailed) {
    return (
      <img
        src={photoUrl}
        alt={user?.name ? `Foto profil ${user.name}` : 'Foto profil'}
        className={`${sizeClass} shrink-0 rounded-full border border-white/60 bg-primary object-cover text-white shadow-card ${className}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={user?.name ? `Avatar ${user.name}` : 'Avatar pengguna'}
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-primary font-extrabold text-white shadow-card ${className}`}
    >
      {initials}
    </div>
  );
}
