#include "../common/types.religo"

type service_version = nat;
type storage = service_storage;
type main_result = (list(operation), storage);

type service_parameter_updates = [@layout:comb] {
    metadata: option(service_metadata),
    allowed_tokens: [@layout:comb] {
        tez: option(bool),
        assets: option(set(address))
    },
    allowed_operation_type: option(operation_type)
}

type signing_key_updates = map(key, option(signing_key));

type asset_value = [@layout:comb] {
    token_address: address,
    token_id: option(nat),
    value: nat
}

type payment = [@layout:comb] {
    id: payment_id,
    asset_value: option(asset_value),
    signature: signature
}

type donation = [@layout:comb] {
    asset_value: option(asset_value),
    payload: option(bytes)
}

type payment_in_tez_sign_payload = (payment_id, service, tez);
type payment_in_asset_sign_payload = (payment_id, service, nat, address, option(nat));

type owner_action =
    | Set_owner(service_owner)
    | Set_pause(bool)
    | Set_deleted(bool)
    | Update_service_parameters(service_parameter_updates)
    | Update_signing_keys(signing_key_updates);

type action =
    | Send_payment(payment)
    | Send_donation(donation)
    | Owner_action(owner_action);
