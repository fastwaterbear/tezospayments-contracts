type service_metadata = bytes;
type service = address;
type service_owner = address;

type allowed_tokens = [@layout:comb] {
    tez: bool,
    assets: set(address)
}

type operation_type = nat;

type signing_key_name = string;
type signing_keys = set((option(signing_key_name), key));

type service_parameters = [@layout:comb] {
    metadata: service_metadata,
    allowed_tokens: allowed_tokens,
    allowed_operation_type: operation_type,
    signing_keys: signing_keys
}
