import {Star, StarFill} from 'react-bootstrap-icons'

export default function RatingStars({value = 0, onChange, size = 'md', readOnly = false, isInvalid = false}) {
    const stars = [1, 2, 3, 4, 5]
    const iconSize = size === 'lg' ? 29 : size === 'sm' ? 16 : 21
    const interactive = !readOnly && !!onChange

    const selectStar = (star) => {
        if (interactive) onChange(star)
    }

    return (
        <div
            className={`d-inline-flex p-1 rounded${isInvalid ? ' border border-danger' : ''}`}
            role="img"
            aria-label={`${value} trên 5 sao`}
            aria-invalid={isInvalid || undefined}
        >
            {stars.map((star) => {
                const filled = star <= value
                const Icon = filled ? StarFill : Star

                return interactive ? (
                    <button
                        key={star}
                        type="button"
                        className="star-icon btn btn-sm p-1 border-0 bg-transparent"
                        style={{lineHeight: 0, color: filled ? '#ffb400' : '#d8d8de'}}
                        aria-label={`Chọn ${star} sao`}
                        aria-pressed={star === value}
                        onClick={() => selectStar(star)}
                    >
                        <Icon size={iconSize}/>
                    </button>
                ) : (
                    <span
                        key={star}
                        className="star-icon"
                        style={{lineHeight: 0, color: filled ? '#ffb400' : '#d8d8de'}}
                    >
            <Icon size={iconSize}/>
          </span>
                )
            })}
        </div>
    )
}