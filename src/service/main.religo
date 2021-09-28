#include "./types.religo"
#include "./errors.religo"
#include "./validation.religo"
#include "./owner-actions.religo"
#include "./actions.religo"

let main = ((action, storage): (action, storage)): main_result => switch (action) {
    | Send_payment(parameters) => {
        fail_if_service_is_not_initialized(storage);
        send_payment(parameters.asset_value, parameters.operation_type, parameters.payload, storage);
      }
    | Owner_action(owner_action) => owner_main(owner_action, storage);
};
