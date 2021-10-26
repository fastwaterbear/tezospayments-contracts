type trusted is address;
type amt is nat;

type account is
 record [
   balance         : amt;
   allowances      : map (trusted, amt);
 ]

type storage is
 record [
   totalSupply     : amt;
   ledger          : big_map (address, account);
 ]

type return is list (operation) * storage

const noOperations : list (operation) = nil;

type transferParams is michelson_pair(address, "from", michelson_pair(address, "to", amt, "value"), "")
type approveParams is michelson_pair(trusted, "spender", amt, "value")
type balanceParams is michelson_pair(address, "owner", contract(amt), "")
type allowanceParams is michelson_pair(michelson_pair(address, "owner", trusted, "spender"), "", contract(amt), "")
type totalSupplyParams is (unit * contract(amt))

type entryAction is
 | Transfer of transferParams
 | Approve of approveParams
 | GetBalance of balanceParams
 | GetAllowance of allowanceParams
 | GetTotalSupply of totalSupplyParams

function getAccount (const addr : address; const s : storage) : account is
 block {
   var acct : account :=
     record [
       balance    = 0n;
       allowances = (map [] : map (address, amt));
     ];

   case s.ledger[addr] of
     None -> skip
   | Some(instance) -> acct := instance
   end;
 } with acct

function getAllowance (const ownerAccount : account; const spender : address; const _s : storage) : amt is
 case ownerAccount.allowances[spender] of
   Some (amt) -> amt
 | None -> 0n
 end;

function transfer (const from_ : address; const to_ : address; const value : amt; var s : storage) : return is
 block {
   var senderAccount : account := getAccount(from_, s);

   if senderAccount.balance < value then
     failwith("NotEnoughBalance")
   else skip;

   if from_ =/= Tezos.sender then block {
     const spenderAllowance : amt = getAllowance(senderAccount, Tezos.sender, s);

     if spenderAllowance < value then
       failwith("NotEnoughAllowance")
     else skip;

     senderAccount.allowances[Tezos.sender] := abs(spenderAllowance - value);
   } else skip;

   senderAccount.balance := abs(senderAccount.balance - value);

   s.ledger[from_] := senderAccount;

   var destAccount : account := getAccount(to_, s);

   destAccount.balance := destAccount.balance + value;

   s.ledger[to_] := destAccount;

 }
 with (noOperations, s)

function approve (const spender : address; const value : amt; var s : storage) : return is
 block {
   var senderAccount : account := getAccount(Tezos.sender, s);

   const spenderAllowance : amt = getAllowance(senderAccount, spender, s);

   if spenderAllowance > 0n and value > 0n then
     failwith("UnsafeAllowanceChange")
   else skip;

   senderAccount.allowances[spender] := value;

   s.ledger[Tezos.sender] := senderAccount;

 } with (noOperations, s)

function getBalance (const owner : address; const contr : contract(amt); var s : storage) : return is
 block {
   const ownerAccount : account = getAccount(owner, s);
 }
 with (list [transaction(ownerAccount.balance, 0tz, contr)], s)

function getAllowance (const owner : address; const spender : address; const contr : contract(amt); var s : storage) : return is
 block {
   const ownerAccount : account = getAccount(owner, s);
   const spenderAllowance : amt = getAllowance(ownerAccount, spender, s);
 } with (list [transaction(spenderAllowance, 0tz, contr)], s)

function getTotalSupply (const contr : contract(amt); var s : storage) : return is
 block {
   skip
 } with (list [transaction(s.totalSupply, 0tz, contr)], s)

function main (const action : entryAction; var s : storage) : return is
 block {
   skip
 } with case action of
   | Transfer(params) -> transfer(params.0, params.1.0, params.1.1, s)
   | Approve(params) -> approve(params.0, params.1, s)
   | GetBalance(params) -> getBalance(params.0, params.1, s)
   | GetAllowance(params) -> getAllowance(params.0.0, params.0.1, params.1, s)
   | GetTotalSupply(params) -> getTotalSupply(params.1, s)
 end;
