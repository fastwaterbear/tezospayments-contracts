#include "./types.religo"
#include "./errors.religo"
#include "./owner-actions.religo"
#include "./actions.religo"

let main = ((action, storage): (action, storage)): main_result => 
    switch (action) {
        | Send_payment(parameters) => send_payment(parameters.asset_value, parameters.payload, storage); 
        | Owner_action(owner_action) => owner_main(owner_action, storage);
    };
