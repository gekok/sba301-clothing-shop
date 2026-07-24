import {OverlayTrigger, Tooltip} from 'react-bootstrap'
import {PencilSquare} from 'react-bootstrap-icons'
import RatingStars from './RatingStars.jsx'
import {EDIT_WINDOW_HOURS, EDIT_DETECTION_TOLERANCE_SECONDS} from '../constant/constants.js'

function formatDate(isoString) {
    const d = new Date(isoString)
    return d.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'})
}

function getInitial(name) {
    return name?.trim()?.charAt(0)?.toUpperCase() || '?'
}

function getEditability(review) {
    if (!review.createdAt) return {canEdit: false, reason: ''}

    const createdAt = new Date(review.createdAt)
    const now = new Date()

    const alreadyEdited = review.updatedAt
        ? Math.abs((new Date(review.updatedAt).getTime() - createdAt.getTime()) / 1000) > EDIT_DETECTION_TOLERANCE_SECONDS
        : false

    if (alreadyEdited) {
        return {canEdit: false, reason: 'Đánh giá này đã được chỉnh sửa trước đó, chỉ được sửa 1 lần.'}
    }

    const expired = now.getTime() > createdAt.getTime() + EDIT_WINDOW_HOURS * 60 * 60 * 1000
    if (expired) {
        return {canEdit: false, reason: 'Đã quá 24 giờ kể từ khi tạo đánh giá, không thể chỉnh sửa.'}
    }

    return {canEdit: true, reason: ''}
}

export default function ReviewItem({review, currentUserId = null, highlight = false, onEdit}) {
    const displayName = review.user?.fullName || 'Người dùng'

    const isOwner = currentUserId != null && review.userId != null && review.userId === currentUserId
    const {canEdit, reason} = isOwner ? getEditability(review) : {canEdit: false, reason: ''}

    return (
        <div className={`review-card p-3 mb-3 ${highlight ? 'border-primary bg-primary-subtle' : 'bg-white'}`}>
            <div className="d-flex gap-3">
                <div className="avatar-circle">{getInitial(displayName)}</div>
                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between flex-wrap">
            <span className="fw-semibold">
              {displayName} {highlight && <span className="badge bg-primary ms-1">Bạn</span>}
            </span>
                        <small className="text-muted">{formatDate(review.createdAt)}</small>
                    </div>
                    <RatingStars value={review.rating} readOnly size="sm"/>
                    <p className="mb-2 mt-2">{review.comment}</p>

                    {isOwner && (
                        canEdit ? (
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-dark rounded-0 fw-bold text-uppercase d-inline-flex align-items-center gap-1"
                                style={{fontSize: '0.75rem'}}
                                onClick={() => onEdit?.(review)}
                            >
                                <PencilSquare/> Sửa
                            </button>
                        ) : (
                            <OverlayTrigger placement="top" overlay={<Tooltip>{reason}</Tooltip>}>
                <span className="d-inline-block">
                  <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-0 fw-bold text-uppercase d-inline-flex align-items-center gap-1"
                      style={{fontSize: '0.75rem', pointerEvents: 'none'}}
                      disabled
                  >
                    <PencilSquare/> Sửa
                  </button>
                </span>
                            </OverlayTrigger>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}