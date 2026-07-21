import { Star, StarFill } from 'react-bootstrap-icons'

/**
 * RatingStars
 * props:
 * - value: number (1-5)
 * - onChange: function(newValue) -> nếu có nghĩa là interactive (chọn sao)
 * - size: 'sm' | 'md' | 'lg'
 * - readOnly: boolean
 */
export default function RatingStars({ value = 0, onChange, size = 'md', readOnly = false }) {
  const stars = [1, 2, 3, 4, 5]
  const iconSize = size === 'lg' ? 29 : size === 'sm' ? 16 : 21
  const interactive = !readOnly && !!onChange

  const selectStar = (star) => {
    if (interactive) onChange(star)
  }

  return (
    <div className="d-inline-flex" role="img" aria-label={`${value} trên 5 sao`}>
      {stars.map((star) => {
        const filled = star <= value
        const Icon = filled ? StarFill : Star

        return interactive ? (
          <button
            key={star}
            type="button"
            className="star-icon btn btn-sm p-1 border-0 bg-transparent"
            style={{ lineHeight: 0, color: filled ? '#ffb400' : '#d8d8de' }}
            aria-label={`Chọn ${star} sao`}
            aria-pressed={star === value}
            onClick={() => selectStar(star)}
          >
            <Icon size={iconSize} />
          </button>
        ) : (
          <span
            key={star}
            className="star-icon"
            style={{ lineHeight: 0, color: filled ? '#ffb400' : '#d8d8de' }}
          >
            <Icon size={iconSize} />
          </span>
        )
      })}
    </div>
  )
}
