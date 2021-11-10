type transfer_fa12_parameters = [@layout:comb] {
    from: address,
    to: address,
    value: nat
};

type transfer_fa20_txs_item = [@layout:comb] {
    to_: address,
    token_id: nat,
    amount: nat
};

type transfer_fa20_parameter_item = [@layout:comb] {
    from_: address,
    txs: list(transfer_fa20_txs_item)
};

type transfer_fa20_parameters = list(transfer_fa20_parameter_item);
