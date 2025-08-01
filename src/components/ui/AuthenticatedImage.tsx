import React, { useState, useEffect } from 'react';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  className,
  fallback,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setHasError(true);
          return;
        }

        const response = await fetch(src, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load image');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
      } catch (error) {
        console.error('Error loading authenticated image:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();

    // Cleanup function to revoke object URL
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src]);

  if (isLoading) {
    return (
      <div className={`bg-gray-100 animate-pulse ${className}`}>
        {/* Loading placeholder */}
      </div>
    );
  }

  if (hasError || !imageSrc) {
    return fallback ? <>{fallback}</> : <div className={`bg-gray-100 ${className}`} />;
  }

  return <img src={imageSrc} alt={alt} className={className} />;
};
