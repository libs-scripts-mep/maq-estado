- [Gerenciador de Máquina de Estados](#gerenciador-de-máquina-de-estados)
  - [Instalando](#instalando)
  - [Desinstalando](#desinstalando)
  - [Resumo da classe](#resumo-da-classe)
  - [Estrutura mínima](#estrutura-mínima)
  - [Adicionando e executando o primeiro estado](#adicionando-e-executando-o-primeiro-estado)
  - [Condição de avanço](#condição-de-avanço)
  - [Insights](#insights)
- [Async Steps](#async-steps)
  - [Configurando um estado como assíncrono](#configurando-um-estado-como-assíncrono)
  - [Inicializando o gerenciador](#inicializando-o-gerenciador)
  - [Exemplo simples de utilização](#exemplo-simples-de-utilização)


# Gerenciador de Máquina de Estados

Biblioteca que manipula uma máquina de estados orientada a objeto.

## Instalando

Abra o terminal, e na pasta do script, rode:

```
npm i @libs-scripts-mep/maq-estado
```

## Desinstalando

Abra o terminal, e na pasta do script, rode:

```
npm uninstall @libs-scripts-mep/maq-estado
```

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

```js
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
            "isAsync": true,
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

## Insights

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

# Async Steps

Classe simples que realiza o gerenciamento das etapas assíncronas em um teste.

## Configurando um estado como assíncrono

É necessário configurar no .json o estado assíncrono da máquina, adicionando o parâmetro `"isAsync": true`:

```json
//.JSON
{
    "Estados": {
        "Atual": null,
        "Historico": [],
        "TesteReles": {
            "isAsync": true,
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

## Inicializando o gerenciador

```js
class Main {
    constructor() {
        UtilsPVI.CarregaJson((config) => {
            this.Config = config
            this.Estados = this.Config.Estados
            this.Estados.Atual = this.Estados.SetupComponentes

            this.Async = new AsyncStep(this.Estados)
            this.Async.init()
        })
    }
}
```

## Exemplo simples de utilização

```js
class Main {
    constructor() {
        UtilsPVI.CarregaJson((config) => {
            this.Config = config
            this.Estados = this.Config.Estados
            this.Estados.Atual = this.Estados.SetupComponentes

            this.Async = new AsyncStep(this.Estados)
            this.Async.init()
        })
    }

    MaquinaDeEstados(state) {
        switch (state) {
            case "TesteReles":

                this.Async.Steps.TesteReles = this.Async.Status.STARTED

                //método fictício, assim que iniciado, imediatamente chama o avanço da maquina de estados.
                this.AcionaReles((retorno)=>{

                    //quando o teste finaliza, atualiza o status novamente para FINISHED
                    this.Async.Steps.TesteReles = this.Async.Status.FINISHED

                    if(retorno){
                        //seta info relatório
                    }else{
                        //seta info relatório
                    }
                })

                //Dessa forma seria possível startar dois testes simultaneamente.
                this.MaquinaDeEstados(MaqEstado.Att(this.Estados, "Avancar"))
                
                break
            case "FinalizaRastreamento":
                    //Após realizado todo roteiro de testes, utiliza-se os métodos auxiliares...
                    const asyncStepsMonitor = setInterval(() => {

                        //verifica se todos os estados assíncronos cadastrados finalizaram.
                        //evita que o rastreamento finalize sem aguardar o retorno dos estados assíncronas
                        if (this.Async.allFinished()) {

                            clearInterval(asyncStepsMonitor)

                            if (this.Config.Rastreamento == true) {

                                RastPVI.setReport(sessionStorage.getItem("SerialNumber"), this.RelatorioTeste, true)
                                RastPVI.end(sessionStorage.getItem("SerialNumber"), RastPVI.evalReport(this.RelatorioTeste), this.ComponentesDeTeste)

                            } else {
                                this.MaquinaDeEstados(MaqEstado.Att(this.Estados, "Avancar"))
                            }
                        }
                    }, 300)

                break
        }
    }
}
```