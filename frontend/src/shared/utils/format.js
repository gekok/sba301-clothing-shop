//Định dạng số sang kiểu Việt: 350000--> "350.00 ₫"

export function formatVND(amount) {
    const number = Number(amount) || 0;
    return number.toLocaleString('vi-VN' , {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    });
}

export function formatDateTime(isoString){
    if(!isoString) return '-';
    const date = new Date(isoString);
    if(Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('vi-VN',{
        day:'2-digit',
        month:'2-digit',
        year:'numeric',
        hour:'2-digit',
        minute:'2-digit',
    });
}