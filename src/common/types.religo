#include "../common/token-types.religo"

type service = address;
type service_owner = address;
type service_version = nat;
type service_metadata = bytes;
type payment_id = string;
type completed_payments = big_map(payment_id, unit)

type allowed_tokens = [@layout:comb] {
    tez: bool,
    assets: set(address)
}

type operation_type = nat;

type signing_key_name = option(string);
type signing_key = [@layout:comb] {
    public_key: key,
    name: signing_key_name
}
type signing_keys = map(key, signing_key);

type service_parameters = [@layout:comb] {
    metadata: service_metadata,
    allowed_tokens: allowed_tokens,
    allowed_operation_type: operation_type,
    signing_keys: signing_keys
}

type add_service_factory_parameters = [@layout:comb] {
    service: service, 
    owner: service_owner
};

type service_storage = {
    version: service_version,
    metadata: service_metadata,
    allowed_tokens: allowed_tokens,
    allowed_operation_type: operation_type,
    signing_keys: signing_keys,
    completed_payments: completed_payments,
    owner: service_owner,
    paused: bool,
    deleted: bool
}

type asset_value = [@layout:comb] {
    token_address: address,
    token_id: option(nat),
    value: nat
}
