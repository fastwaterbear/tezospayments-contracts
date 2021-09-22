type service_metadata = bytes;
type service = address;
type service_owner = address;

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
