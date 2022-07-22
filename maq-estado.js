class MaqEstado {

    static Att(estados, opcao = "Avancar") {

        console.log(estados.Atual)
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

    }

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

    static TesteConcluido(testesPendentes, testeConcluido) {

        Object.keys(testesPendentes).forEach(teste => {
            if (teste == testeConcluido) {

                console.log(`Teste ${testeConcluido} Concluído`)

                testesPendentes[testeConcluido].Status = true

            }
        })

    }
}