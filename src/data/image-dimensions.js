const dimensions = {
  '/images/building-plumbing-pipework.webp': [1054, 1400],
  '/images/building-services-installation.webp': [933, 1400],
  '/images/construction-site-engineer.webp': [2000, 1125],
  '/images/electrical-cable-and-pipeline-systems.webp': [2000, 1333],
  '/images/engineer-commissioning-pump-room.webp': [933, 1400],
  '/images/home-hero-ultra-site-engineer.webp': [2000, 1125],
  '/images/industrial-facility-installation.webp': [2000, 1334],
  '/images/industrial-pipeline-installation.webp': [1050, 1400],
  '/images/industrial-pipework-interior.webp': [1050, 1400],
  '/images/industrial-rooftop-equipment.webp': [1867, 1400],
  '/images/mechanical-building-services.webp': [2000, 1333],
  '/images/mechanical-hvac-pipeline-installation.webp': [2000, 1330],
  '/images/mep-engineering-plans-review.webp': [933, 1400],
  '/images/overhead-mep-services.webp': [933, 1400],
  '/images/site-engineer-inspection.webp': [935, 1400],
  '/images/technician-installing-mechanical-system.webp': [1054, 1400],
};

export function imageDimensions(src) {
  const [width, height] = dimensions[src] || [];
  return width && height ? { width, height } : null;
}

export function imageDimensionAttributes(src) {
  const size = imageDimensions(src);
  const { width, height } = size || {};
  return width && height ? `width="${width}" height="${height}"` : '';
}
