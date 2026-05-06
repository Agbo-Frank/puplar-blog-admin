import logoLight from '../../assets/logo-light.png';
import logoDark from '../../assets/logo-dark.png';

interface LogoProps {
  color?: 'light' | 'dark';
  className?: string;
}

export function Logo({ color = 'dark', className = 'h-7' }: LogoProps) {
  return (
    <img src={color === 'light' ? logoLight : logoDark} alt="Puplar" className={className} />
  );
}
