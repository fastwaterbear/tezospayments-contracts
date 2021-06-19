#include "../common/types.religo"

type storage = {
    metadata: service_metadata,
    allowed_tokens: allowed_tokens,
    owner: service_owner,
    paused: bool,
    deleted: bool,
}

type main_result = (list(operation), storage);

type service_parameters_updates = [@layout:comb] {
    metadata: option(service_metadata),
    allowed_tokens: [@layout:comb] {
        tez: option(bool),
        assets: option(set(address))
    }
}

type asset_value = [@layout:comb] {
    token_address: address,
    value: nat
}

type payment_payload = [@layout:comb]
    | Public(bytes)
    | Private(bytes)
    | Public_and_private((bytes, bytes))

type send_payment_parameters = [@layout:comb] {
    asset_value: option(asset_value),
    payload: payment_payload
}

type owner_action =
    | Set_owner(service_owner)
    | Set_pause(bool)
    | Set_deleted(bool)
    | Update_service_parameters(service_parameters_updates);

type action =
    | Send_payment(send_payment_parameters)
    | Owner_action(owner_action);
