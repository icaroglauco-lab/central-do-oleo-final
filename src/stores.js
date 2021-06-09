

/*
Stores da plataforma

digere para visualização por ações procedurais com pipes, listando e a partir dai, 
usando docdata para observar o docmento a ser digerido, e da subscribe nele para 
alterações no armazenamento da store

historico: digere carros, representantes e serviços
servicos: digere carros
clientes: digere carros
representantes: digere clientes
*/

import { readable, writable } from "svelte/store";
import { firestore } from './firebase';
import { collectionData, docData } from 'rxfire/firestore';
import { tap, map, filter, switchMap } from 'rxjs/operators';
import { of, combineLatest, from } from "rxjs";

//sessão ad
export const sessãoAdm = writable(null);

//ip acess
export const ipAcess = readable(["*"], function start(set) {
    const dev = true; //desative no lançamento

    const ipAcessRef = firestore.collection("ipAcess");
    from(collectionData(ipAcessRef))
    .subscribe(results => {
        set(results.map(re => re.ip));
    })
});

// 1 - Refs
const carrosRef = firestore.collection("Carros");
const servicosRef = firestore.collection("Services");
const historicoRef = firestore.collection("Histories");
const clientesRef = firestore.collection("Clientes");
const representantesRef = firestore.collection("Representantes");

//2 - store de representantes, digere clientes, carros = visualização
export const representantes = readable([], function start(set) {

    /*
    passo 1, listar os representantes
    passo 2, listar os clientes no lugar das ids dos clientes (array clientes dentro de representante)
    passo 3, listar os carros em cada cliente, no lugar das ids dos carros (array carros dentro de clientes)
    passo 4, listar os serviços em cada carro, a partir da coleção de serviços com ids dos carros, criando uma array em carro
    */

    /*teste 2
    esse teste vai tentar pegar source de todas as collections e combinelatest com elas
    e depois usar switchmap para usar elas para ir montando o modelo de dado

    resultado: deu certo
    */
    let reps$ = collectionData(representantesRef);
    let carros$ = collectionData(carrosRef);
    let clientes$ = collectionData(clientesRef);
    let servicos$ = collectionData(servicosRef);

    combineLatest([
        reps$,
        clientes$,
        carros$,
        servicos$
    ]).pipe(
        switchMap( results => {
            let [reps, clientes, carros, servicos] = results;
            let tree = [...reps];

            tree = tree.map( rep_ => {
                if ("clientes" in rep_) {
                    let aux = {...rep_};
                    
                    let servicos_ = servicos.filter(ser => ser.representante === aux.id);
                    
                    aux.clientes = aux.clientes.map( cli_ => {
                        let _c_ = clientes.find( c => c.id === cli_);

                        if(!_c_) return null;
                        
                        if("data" in _c_) delete _c_["data"];
                        
                        if("carros" in _c_)  {
                            _c_ = { ..._c_,
                                carros : _c_.carros.map( car_ => {
                                    let find = carros.find( c => c.id === car_);
                                    if(find!==undefined) find.servicos = servicos_.filter(ser => ser.carro === find.id);
                                    return find;
                                }),
                            }
                        }

                        return _c_;

                    });

                    return aux;
                } 

                return rep_;
            });

            return of(tree);
        })
    )
    .subscribe( result => {
        set(result);
    })

	return function stop() {};
});

//3 - store de servicos, digere carros = visualização
export const servicos = readable([], function start(set) {
	collectionData(servicosRef, 'id')
    .subscribe(reps => { 
        set(reps);
    })
	return function stop() {};
});

//4 - store de historicos, digere carros, representantes e serviços = visualização
export const historico = readable([], function start(set) {

    //4.1 local array para controle de estado
    let initial = [];

    collectionData(historicoRef)
    .pipe(
        //4.2 bootup o valor inicial
        tap ( historicos => {
            initial = historicos
        }),

        //4.3 digestão de representantes para absorver quaisquers campos necessários
        tap ( historicos => {
            historicos.forEach( (single_historico, i) => {
                docData(firestore.collection('Representantes').doc(single_historico.representante))
                    .pipe(map(d=> ({...initial[i], representante_nome: d.nome}))) //4.3.0 - valores
                    .subscribe(single_result => {
                        initial[i] = single_result;
                        set(initial);
                    })
            })
        }),

        //4.4 ; carros
        tap ( historicos => {
            historicos.forEach( (single_historico, i) => {
                docData(firestore.collection('Carros').doc(single_historico.carro))
                    .pipe(map(d=> ({...initial[i], placa: d.placa, modelo: d.modelo}))) //4.4.0 - valores
                    .subscribe(single_result => {
                        initial[i] = single_result;
                        set(initial);
                    })
            })
        }),

        //4.4 ; serviços, principalmente para o valor
        tap ( historicos => {
            historicos.forEach( (single_historico, i) => {
                docData(firestore.collection('Services').doc(single_historico.servico))
                    .pipe(map(d=> ({...initial[i], valor: d.valor, entrada: d.entrada}))) //4.5.0 - valores
                    .subscribe(single_result => {
                        initial[i] = single_result;
                        set(initial);
                    })
            })
        }),
    )
    .subscribe(fullresult => {});

	return function stop() {};
});

//5 - store de clientes, digere carros = visualização
export const clientes = readable([], function start(set) {
	collectionData(clientesRef, 'id')
    .subscribe(reps => { 
        set(reps);
    })
	return function stop() {};
});

//6 - store de carros
export const carros = readable([], function start(set) {
	collectionData(carrosRef, 'id')
    .subscribe(reps => { 
        set(reps);
    })
	return function stop() {};
});




/// mobile

export const sessão = writable(null);
// { //de teste
//     "autorizado" : true,
//     "clientes" : ["jMQlo8Fv5hWLHtltlYoW", "d9hQmikawTQqoDijZFFH"],
//     'id' : "5mEFH29VLguTVq1jmRjv",
//     "nome" : "Ícaro Glauco",
//     "senha" : "@Icaro210955",
//     "telefone" : "77999607779",
//     "usuario" : "icaroglauco",
// }


export const sessão_clientes = readable([], function start(set) {
    let clientes$ = collectionData(clientesRef);
    let servicos$ = collectionData(servicosRef);
    let carros$ = collectionData(carrosRef);

    combineLatest([
        servicos$,
        clientes$,
        carros$
    ])
    .pipe(
        switchMap( results => {
            let [servicos, clientes, carros] = results;
            let tree = [...clientes];

            tree = tree.map( cliente => {
                let _c_ = {...cliente};

                if("carros" in _c_)  {
                    _c_ = { ..._c_,
                        carros : _c_.carros.map( car_ => {
                            let find = carros.find( c => c.id === car_);
                            if(find) find.servicos = servicos.filter(ser => ser.carro === find.id);
                            return find;
                        }),
                    }
                }
                return _c_;
            } );

            return of(tree);
        })
    )
    .subscribe( values => {

        sessão.subscribe(sessão_data => {
            set(values.filter(cliente => {
                if("clientes" in sessão_data)
                    return sessão_data.clientes.includes(cliente.id);
                return false;
            }))
        });
    })
	return function stop() {};
});
