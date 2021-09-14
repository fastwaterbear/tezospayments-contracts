#include "../services-factory/types.religo"

let service_factory_function: service_factory_function = [%Michelson ({| {
    UNPAIR ;
    PUSH nat 0 ;
    SWAP ;
    DUP ;
    DUG 2 ;
    GET 3 ;
    CDR ;
    SIZE ;
    COMPARE ;
    EQ ;
    SWAP ;
    DUP ;
    DUG 2 ;
    GET 3 ;
    CAR ;
    NOT ;
    AND ;
    IF { PUSH string "No allowed tokens" ; FAILWITH } {} ;
    DUP ;
    GET 5 ;
    PUSH nat 3 ;
    PUSH nat 3 ;
    DUP 3 ;
    OR ;
    COMPARE ;
    NEQ ;
    PUSH nat 0 ;
    DIG 2 ;
    COMPARE ;
    EQ ;
    OR ;
    IF { PUSH string "Invalid operation type" ; FAILWITH } {} ;
    DUP ;
    GET 6 ;
    ITER { CDR ;
           CDR ;
           IF_NONE
             { UNIT }
             { PUSH nat 30 ;
               SWAP ;
               DUP ;
               DUG 2 ;
               SIZE ;
               COMPARE ;
               GT ;
               PUSH nat 3 ;
               DIG 2 ;
               SIZE ;
               COMPARE ;
               LT ;
               OR ;
               IF { PUSH string "Invalid signing key" ; FAILWITH } { PUSH unit Unit } } ;
           DROP } ;
    DUP ;
    DUG 2 ;
    GET 6 ;
    PAIR ;
    PUSH bool False ;
    SENDER ;
    PAIR ;
    PAIR ;
    SWAP ;
    DUP ;
    DUG 2 ;
    CAR ;
    PUSH bool False ;
    PAIR ;
    DUP 3 ;
    GET 3 ;
    DIG 3 ;
    GET 5 ;
    PAIR ;
    PAIR ;
    PAIR ;
    AMOUNT ;
    NONE key_hash ;

    CREATE_CONTRACT
#include "../../build/michelson/service.tz"
        ;
    PAIR
} |}: service_factory_function)];

let main = (_: (service_factory_function, unit)): (list(operation), unit) => failwith("Should not be called")
