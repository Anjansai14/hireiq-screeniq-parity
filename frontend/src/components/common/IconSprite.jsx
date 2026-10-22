import React from 'react';
import { SvgDefinitions } from '../icons/Icons';

/** Mount once at the app root so every <Icon> can reference the SVG symbols */
export default function IconSprite() {
  return <SvgDefinitions />;
}
