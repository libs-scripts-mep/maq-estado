class MaqEstado {

    /**
     * Promove a atualização do estado atual
     * @param {object} estados 
     * @param {string} opcao 
     * @returns {string} estado
     */
    static Att(estados, opcao = "Avancar") {

        if (estados.Atual != null) {
            console.groupEnd(estados.Atual.Nome)
            estados.Historico.push(estados.Atual)

            switch (opcao) {

                case "Executar":
                    console.group(estados.Atual.Nome)
                    return estados.Atual.Nome

                case "Avancar":
                    if (estados.Atual.hasOwnProperty("Avancar")) {
                        estados.Atual = procuraEstado(estados, estados.Atual.Avancar)

                        if (estados.Atual != null) {
                            console.group(estados.Atual.Nome)
                            return estados.Atual.Nome

                        } else {
                            pvi.runInstructionS("RESET", [])
                            alert(`maq-estado.js\n\nEstado de avanço [${estados.Historico[estados.Historico.length - 1]["Avancar"]}] não encontrado em [${estados.Historico[estados.Historico.length - 1]["Nome"]}]\n\nO script será PAUSADO.`)
                        }

                    } else {
                        pvi.runInstructionS("RESET", [])
                        alert(`maq-estado.js\n\nO estado [${estados.Atual.Nome}] não possui a propriedade 'Avancar' definida.\n\nO script será PAUSADO.`)
                    }
                    break

                case "Anterior":
                    estados.Atual = estadoAnterior(estados.Historico, estados)
                    console.group(estados.Atual.Nome)
                    return estados.Atual.Nome

                case "FalhaCritica":
                    if (estados.Atual.hasOwnProperty("FalhaCritica")) {
                        estados.Atual = procuraEstado(estados, estados.Atual.FalhaCritica)

                        if (estados.Atual != null) {
                            console.group(estados.Atual.Nome)
                            return estados.Atual.Nome

                        } else {
                            pvi.runInstructionS("RESET", [])
                            alert(`maq-estado.js\n\nEstado de falha crítica [${estados.Historico[estados.Historico.length - 1]["FalhaCritica"]}] não encontrado em [${estados.Historico[estados.Historico.length - 1]["Nome"]}]\n\nO script será PAUSADO.`)
                        }

                    } else {
                        pvi.runInstructionS("RESET", [])
                        alert(`maq-estado.js\n\nO estado [${estados.Atual.Nome}] não possui a propriedade 'FalhaCritica' definida.\n\nO script será PAUSADO.`)
                    }
                    break

                default:
                    pvi.runInstructionS("RESET", [])
                    alert("maq-estado.js\n\nOpção informada inválida!")
                    break

            }
        } else {
            pvi.runInstructionS("RESET", [])
            alert("maq-estado.js\n\nImpossível atuar em um objeto igual a null!!\n\nO script será PAUSADO.")
        }

        function estadoAnterior(historicoEstados, estados) {

            let offset = 2
            return procuraEstado(estados, historicoEstados[historicoEstados.length - offset].Nome)

        }

        function procuraEstado(estados, proximoEstado) {

            let estadoRetornado = null

            Object.keys(estados).forEach(estado => {
                if (estado == proximoEstado) {
                    if (estadoRetornado == null) {
                        estadoRetornado = estados[estado]
                    }
                }
            })

            return estadoRetornado
        }
    }

    /**
     * Verifica de existe algum teste pendente (Status: false)
     * @param {object} estadoAtual 
     * @returns {boolean} pendencias
     */
    static ControleAvanco(estadoAtual) {

        let props = Object.entries(estadoAtual)
        let pendencias = null

        props.forEach((teste) => {
            if (pendencias == null || pendencias == false) {
                teste[1].Status ? pendencias = false : pendencias = true
            }
        })

        return pendencias

    }

    /**
     * Retorna nome do primeiro teste pendente no estado atual
     * @param {object} estadoAtual 
     * @returns {string} nomeTestePendente
     */
    static NomeTestePendente(estadoAtual) {

        let props = Object.entries(estadoAtual)
        let nomeTestePendente = null

        props.forEach((teste) => {
            if (nomeTestePendente == null) {
                if (!teste[1].Status) {
                    nomeTestePendente = teste[0]
                }
            }
        })

        return nomeTestePendente

    }

    /**
     * Retorna o índice do primeiro teste pendente no estado atual
     * @param {object} estadoAtual 
     * @returns {number} indiceTeste
     */
    static IndiceTestePendente(estadoAtual) {

        let props = Object.entries(estadoAtual)
        let indiceTeste = null

        props.forEach((teste) => {
            if (indiceTeste == null) {
                if (!teste[1].Status) {
                    indiceTeste = teste[1].Indice
                }
            }
        })

        return indiceTeste

    }

    /**
     * Modifica o status do teste pendente, possibilitando o avanço para o próximo teste.
     * @param {object} testesPendentes 
     * @param {string} testeConcluido 
     */
    static TesteConcluido(testesPendentes, testeConcluido) {

        Object.keys(testesPendentes).forEach(teste => {
            if (teste == testeConcluido) {

                console.log(`Teste ${testeConcluido} Concluído`)

                testesPendentes[testeConcluido].Status = true

            }
        })

    }
}

class AsyncStep {
    constructor(stateMachine) {
        this.Status = {
            STANDBY: 0,
            STARTED: 1,
            FINISHED: 3,
            ABORTED: 4
        }
        this.Steps = new Object()
        this.StateMachine = stateMachine
    }

    /**
     * Verifica se todas as etapas assíncronas terminaram
     * @returns {boolean}
     */
    init() {
        Object.entries(this.StateMachine).forEach((state) => {
            if (state[1].isAsync) {
                state[1].Nome != "Atual" ? this.addStep(state[1].Nome) : null
            }
        })
    }

    /**
     * Adiciona uma etapa ao objeto
     * @returns {boolean}
     */
    addStep(step, status = this.Status.STANDBY) {
        this.Steps[step] = status
    }

    /**
     * Detela uma etapa do objeto
     * @returns {boolean}
     */
    deleteStep(step) {
        delete this.Steps[step]
    }

    /**
    * Retorna a lista de etapas num array
    * @returns {Array}
    */
    getStepsAsArray() {
        return Object.entries(this.Steps)
    }

    /**
     * Verifica se existe etapa cadastrada
     * @returns {boolean}
     */
    hasSteps() {
        return this.getStepsAsArray().length > 0
    }

    /**
     * Verifica se alguma etapa assíncrona iniciou
     * @returns {boolean}
     */
    someStarted() {
        if (this.hasSteps()) {
            let someStarted = false
            this.getStepsAsArray().forEach((step) => {
                if (step[1] != this.Status.STANDBY) {
                    someStarted = true
                }
            })
            return someStarted
        } else {
            return null
        }
    }

    /**
     * Verifica se todas as etapas assíncronas terminaram
     * @returns {boolean}
     */
    allFinished() {
        if (this.hasSteps()) {
            let allFinished = true
            this.getStepsAsArray().forEach((step) => {
                if (step[1] != this.Status.FINISHED) {
                    allFinished = false
                }
            })
            return allFinished
        } else {
            return null
        }
    }
}