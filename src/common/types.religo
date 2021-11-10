#include "../common/token-types.religo"

type service = address;
type service_owner = address;
type service_version = nat;
type service_metadata = bytes;

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
    owner: service_owner,
    signing_keys: signing_keys,
    paused: bool,
    deleted: bool
}
