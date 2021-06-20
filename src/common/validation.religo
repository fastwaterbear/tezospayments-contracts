#include "./types.religo"
#include "./constants.religo"
#include "./errors.religo"

[@inline] let fail_if_operation_type_is_invalid = (operation_type: operation_type)
    =>  if (operation_type == 0n || Bitwise.or(operation_type, constant_all_operation_type) != constant_all_operation_type) { 
            failwith(errors_invalid_operation_type);
        };
