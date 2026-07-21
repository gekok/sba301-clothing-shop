package com.sba301.ecommerce.features.pos.dto;

import com.sba301.ecommerce.features.entities.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePosOrderRequest {

    // Trần số lượng cho 1 dòng hàng. Bán tại quầy không ai mua 1000 cái cùng lúc,
    // đặt trần là để chặn số lượng phi lý gây tràn số, không phải giới hạn nghiệp vụ.
    public static final int MAX_QUANTITY_PER_LINE = 1000;

    // @Valid ở đây mới kích hoạt kiểm tra bên trong từng phần tử của danh sách.
    // Thiếu nó thì @NotNull/@Min của Item bị bỏ qua hoàn toàn.
    @NotEmpty(message = "Hoá đơn phải có ít nhất 1 sản phẩm")
    @Valid
    private List<Item> items;

    // Khách vãng lai không cần khai tên -> để trống được, khi đó ghi "Khách lẻ".
    private String customerName;

    private String note;

    // Null thì hiểu là tiền mặt - kiểu bán tại quầy phổ biến nhất.
    private PaymentMethod paymentMethod;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {

        @NotNull(message = "Thiếu variantId")
        private Long variantId;

        // Phải có TRẦN, không chỉ @Min. Thiếu @Max thì client gửi 2 dòng cùng variantId,
        // mỗi dòng 2 tỷ -> lúc cộng gộp bị tràn kiểu int thành số ÂM -> lọt qua chốt
        // kiểm tồn kho -> cộng khống kho và tạo đơn có tiền âm.
        @NotNull(message = "Thiếu số lượng")
        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        @Max(value = MAX_QUANTITY_PER_LINE, message = "Số lượng tối đa " + MAX_QUANTITY_PER_LINE + " sản phẩm mỗi dòng")
        private Integer quantity;
    }
}
