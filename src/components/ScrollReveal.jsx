import { useScrollReveal } from '../hooks/useScrollReveal'

const variantClasses = {
  up: {
    hidden: 'reveal-hidden',
    visible: 'reveal-visible',
  },
  left: {
    hidden: 'reveal-left-hidden',
    visible: 'reveal-left-visible',
  },
  right: {
    hidden: 'reveal-right-hidden',
    visible: 'reveal-right-visible',
  },
  scale: {
    hidden: 'reveal-scale-hidden',
    visible: 'reveal-scale-visible',
  },
}

export default function ScrollReveal({
  children,
  variant = 'up',
  delay = 0,
  className = '',
  as: Component = 'div',
}) {
  const { ref, isVisible } = useScrollReveal()
  const classes = variantClasses[variant] ?? variantClasses.up

  return (
    <Component
      ref={ref}
      className={`${isVisible ? classes.visible : classes.hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  )
}
