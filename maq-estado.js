class MaqEstado {

    /**
     * Promove a atualização do estado atual
     * @param {object} estados 
     * @param {string} opcao 
     * @returns {string} estado
     */
    static Att(estados, opcao = "Avancar", timeout = 0) {

        setTimeout(() => {
            
            console.groupEnd(estados.Atual.Nome)
            estados.Historico.push(estados.Atual)

            switch (opcao) {

                case "Executar":
                    console.group(estados.Atual.Nome)
                    return estados.Atual.Nome

                case "Avancar":
                    estados.Atual = procuraEstado(estados, estados.Atual.Avancar)
                    console.group(estados.Atual.Nome)
                    return estados.Atual.Nome

                case "Anterior":
                    estados.Atual = estadoAnterior(estados.Historico, estados)
                    console.group(estados.Atual.Nome)
                    return estados.Atual.Nome

                case "FalhaCritica":
                    estados.Atual = procuraEstado(estados, estados.Atual.FalhaCritica)
                    console.group(estados.Atual.Nome)
                    return estados.Atual.Nome

                default:
                    break

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
        }, timeout);
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