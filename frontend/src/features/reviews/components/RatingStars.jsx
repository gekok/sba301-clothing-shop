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
  const fontSize = size === 'lg' ? '1.8rem' : size === 'sm' ? '1rem' : '1.3rem'

  return (
    <div className="d-inline-flex" role="img" aria-label={`${value} trên 5 sao`}>
      {stars.map((star) => {
        const filled = star <= value
        return (
          <span
            key={star}
            className="star-icon"
            style={{
              fontSize,
              color: filled ? '#ffb400' : '#d8d8de',
              cursor: readOnly || !onChange ? 'default' : 'pointer',
            }}
            onClick={() => !readOnly && onChange && onChange(star)}
          >
            ★
          </span>
        )
      })}
    </div>
  )
}
