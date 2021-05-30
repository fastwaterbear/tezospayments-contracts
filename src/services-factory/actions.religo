#include "./types.religo"
#include "./errors.religo"

let create_service = ((_service_metadata, _storage): (service_metadata, storage)): main_result => {
    (failwith(errors_not_implemented): main_result);
};
