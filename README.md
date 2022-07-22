- [Gerenciador de Máquina de Estados](#gerenciador-de-máquina-de-estados)
  - [Resumo da classe](#resumo-da-classe)
  - [Estrutura mínima](#estrutura-mínima)
  - [Adicionando e executando o primeiro estado](#adicionando-e-executando-o-primeiro-estado)
  - [Condição de avanço](#condição-de-avanço)
  - [Use a criatividade...](#use-a-criatividade)

# Gerenciador de Máquina de Estados

Biblioteca conta com uma classe que contém métodos estáticos que auxiliam na manipulação de uma máquina de estados orientada a objeto.

## Resumo da classe

```js

class MaqEstado {

    /**
     * Promove a atualização do estado atual
     * @param {object} estados 
     * @param {string} opcao 
     * @returns {string} estado
     */
    static Att(estados, opcao = "Avancar") {
        estados.Historico.push(estados.Atual)
        switch (opcao) {
            case "Executar":
            case "Avancar":
            case "Anterior":
            case "FalhaCritica":
        }
    }

    /**
     * Verifica de existe algum teste pendente (Status: false)
     * @param {object} estadoAtual 
     * @returns {boolean} pendencias
     */
    static ControleAvanco(estadoAtual) {
        return pendencias
    }

    /**
     * Retorna nome do primeiro teste pendente no estado atual
     * @param {object} estadoAtual 
     * @returns {string} nomeTestePendente
     */
    static NomeTestePendente(estadoAtual) {
        return nomeTestePendente
    }

    /**
     * Retorna o índice do primeiro teste pendente no estado atual
     * @param {object} estadoAtual 
     * @returns {number} indiceTeste
     */
    static IndiceTestePendente(estadoAtual) {
        return indiceTeste
    }

    /**
     * Modifica o status do teste pendente, possibilitando o avanço para o próximo teste.
     * @param {object} testesPendentes 
     * @param {string} testeConcluido 
     */
    static TesteConcluido(testesPendentes, testeConcluido) {
        testesPendentes[testeConcluido].Status = true
    }
}
```

## Estrutura mínima

O arquivo .JSON de configuração de produto precisa ter previamente uma estrutura mínima para o correto funcionamento da classe:

1. Um objeto pai de nome ***Estados*** para realizar o agrupamento de cada estado e demais propriedades importantes.
2. Uma propriedade do objeto pai chamada ***Atual***, que armazenará o estado atual a cada avanço de estado.
3. Uma propriedade do objeto pai chamada ***Historico***, que será populada a cada execução ou avanço de um estado afim de manter o histórico de execução do script.

Exemplo:

```json
//.JSON

{
    "Estados": {
        "Atual": null,
        "Historico": []
    }
}
```
## Adicionando e executando o primeiro estado

A partir da estrutura mínima é possível adicionar estados. Cuidados necessários na inclusão de estados:

1. Os nomes dos estados ***nunca*** devem se repetir.
2. O estado ***deve*** ter uma propriedade chamada ***Nome***
3. Com exceção do último estado configurado, o estado adicionado ***deve*** ter uma propriedade chamada ***Avancar***, o valor deve apontar para o próximo estado.
4. Em caso de falha crítica, é possível customizar o próximo estado atribuindo o novo valor à propriedade ***FalhaCritica***

```json
//.JSON

{
    "Estados": {
        "Atual": null,
        "Historico": [],
        "Energizacao": {
            "Nome": "Energizacao",
            "Avancar": "EstabeleceComunicacao"
        },
        "EstabeleceComunicacao": {
            "Nome": "EstabeleceComunicacao",
            "Avancar": "FinalizaRastreamento",
            "FalhaCritica": "Finalizacao"
        },
        "FinalizaRastreamento": {
            "Nome": "FinalizaRastreamento",
            "Avancar": "Finalizacao"
        },
        "Finalizacao": {
            "Nome": "Finalizacao"
        }
    }
}
```

```js
//Main.js

class Main {
    constructor() {

        this.CarregaJson(() => {

            //Popula uma variável com os estados configurados no .JSON
            this.Estados = this.Config.Estados

            //Atribui o objeto do estado inicial desejado manualmente o estado atual.
            this.Estados.Atual = this.Estados.Energizacao

            //Manda executar
            this.MaquinaDeEstados(MaqEstado.Att(this.Estados, "Executar"))
        })

    }

    MaquinaDeEstados(estado){
        switch(estado){
            case "Energizacao":
                //Executa o script a partir daqui...

                ...

                //Faz o que tem que fazer, e avança..
                this.MaquinaDeEstados(MaqEstado.Att(this.Estados, "Avancar"))
            break

            ...
        }
    }
}
```

## Condição de avanço

É uma estrutura de recursão de um estado baseado em ***subtestes*** contemplados ou não. Até que todos os subtestes estejam com o ```Status == true```.

Exemplo:

```json
//.JSON

{
    "Estados": {
        "Atual": null,
        "Historico": [],
        "TesteReles": {
            "Nome": "TesteReles",
            "Avancar": "TesteMOSFETs",
            "FalhaCritica": "FinalizaRastreamento",
            "CondicaoAvanco": {
                "ReleClorador": {
                    "Status": false,
                    "EntradaDAQ": "ac3"
                },
                "ReleAquecimento": {
                    "Status": false,
                    "EntradaDAQ": "ac2"
                }
            }
        }
    }
}
```

```js
//Main.js

MaquinaDeEstados(estado){
    switch (estado) {
        case "TesteReles":
            //Se houver subteste para ser testado, entra no if, caso tenha testado todos, avança para o próximo estado.
            if (MaqEstado.ControleAvanco(this.Estados.Atual.CondicaoAvanco)) {

                let nomeTesteAtual = MaqEstado.NomeTestePendente(this.Estados.Atual.CondicaoAvanco)

                if (this.Estados.Atual.CondicaoAvanco[nomeTesteAtual].EntradaDAQ.value) {
                    this.Relatorio.set(nomeTesteAtual, true)
                } else {
                    this.Relatorio.set(nomeTesteAtual, false)
                }
                //Marca subteste atual como testado, independente do resultado.
                MaqEstado.TesteConcluido(this.Estados.Atual.CondicaoAvanco, nomeTesteAtual)

                //Promove a recursao no estado para realizar o próximo subteste.
                this.MaquinaDeEstados(MaqEstado.Att(this.Estados, "Executar"))

            } else {

                //Como não há mais subtestes a serem realizados, pode avançar para o próximo estado.
                this.MaquinaDeEstados(MaqEstado.Att(this.Estados, "Avancar"))
            }
            break
    }
}
```

## Use a criatividade...

Aproveite o fato de que cada estado da máquina de estado é um objeto e poder ter diversas propriedades, para agrupar os parâmetros de cada estado de acordo com o teste a ser realizado.

Dessa forma, cada configuração do estado fica intuitiva, pois está agrupado ao mesmo.

Exemplo:

```json
{
    "Estados": {
        "Atual": null,
        "Historico": [],
        "Energizacao": {
            "Nome": "Energizacao",
            "Avancar": "EstabeleceComunicacao",
            "FalhaCritica": "FinalizaRastreamento",
            "Tensao":220
        },
        "EstabeleceComunicacao": {
            "Nome": "EstabeleceComunicacao",
            "Avancar": "TesteSensoresTemperatura",
            "FalhaCritica": "FinalizaRastreamento",
            "Requisicao": [
                "42 04 F5 00 00 00 49"
            ],
            "RegexResposta": "[4][A][ ][0][4][ ][5][F][ ][0][0][ ][0][0]"
        },
        "TesteSensoresTemperatura": {
            "Nome": "TesteSensoresTemperatura",
            "Avancar": "TesteReles",
            "FalhaCritica": "FinalizaRastreamento",
            "NTC1": {
                "Target": 25,
                "Tolerancia": 2
            },
            "NTC2": {
                "Target": 35,
                "Tolerancia": 2
            }
        },
        "TesteReles": {
            "Nome": "TesteReles",
            "Avancar": "TesteMOSFETs",
            "FalhaCritica": "FinalizaRastreamento",
            "CondicaoAvanco": {
                "ReleClorador": {
                    "Status": false,
                    "EntradaDAQ": "ac3",
                    "Tentativas": 0,
                    "Requisicao": [
                        "42 04 F5 00 00 01 4E"
                    ],
                    "RegexResposta": "[4][A][ ][0][4][ ][5][F][ ][0][0][ ][0][0][ ][0][1]"
                },
                "ReleAquecimento": {
                    "Status": false,
                    "EntradaDAQ": "ac2",
                    "Tentativas": 0,
                    "Requisicao": [
                        "42 04 F5 00 00 02 47"
                    ],
                    "RegexResposta": "[4][A][ ][0][4][ ][5][F][ ][0][0][ ][0][0][ ][0][2]"
                }
            }
        },
        "FinalizaRastreamento": {
            "Nome": "FinalizaRastreamento",
            "Avancar": "Finalizacao"
        },
        "Finalizacao": {
            "Nome": "Finalizacao"
        }
    }
}
```

