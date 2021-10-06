#include "../common/types.religo"

type service_version = nat;
type storage = service_storage;
type main_result = (list(operation), storage);

type asset_value = [@layout:comb] {
    token_address: address,
    value: nat
}

type service_parameter_updates = [@layout:comb] {
    metadata: option(service_metadata),
    allowed_tokens: [@layout:comb] {
        tez: option(bool),
        assets: option(set(address))
    },
    allowed_operation_type: option(operation_type)
}

type signing_key_updates = map(key, option(signing_key));

type payment_payload = [@layout:comb]
    | Public(bytes)
    | Private(bytes)
    | Public_and_private((bytes, bytes))

type send_payment_parameters = [@layout:comb] {
    asset_value: option(asset_value),
    operation_type: operation_type, 
    payload: payment_payload
}

type owner_action =
    | Set_owner(service_owner)
    | Set_pause(bool)
    | Set_deleted(bool)
    | Update_service_parameters(service_parameter_updates)
    | Update_signing_keys(signing_key_updates);

type action =
    | Send_payment(send_payment_parameters)
    | Owner_action(owner_action);
