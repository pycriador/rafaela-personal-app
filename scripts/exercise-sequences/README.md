# Sequências de exercícios

Processamento local dos 302 conjuntos (906 frames), sem geração de desenhos por IA.

## O que está implementado

`engine.py` registra os frames por correspondências visuais nas regiões de apoio,
limita escala, rotação e deslocamento, mantém uma margem comum para a sequência e
estabiliza pequenas regiões que já coincidem entre os três desenhos. Quando não
encontra correspondências suficientes, conserva o enquadramento original.
As poses continuam distintas; exercícios isométricos também conservam seus frames.

Isso **não reconstrói perspectivas diferentes** e não garante que todos os
exercícios tenham a continuidade das duas correções individuais aprovadas.
O relatório marca os demais como `individual-visual-review-needed`.
Os testes de arquivo não substituem essa revisão visual.

Chair Dip e Cadeira Extensora são preservados byte a byte. Seus scripts de
reconstrução estão em `../align-chair-dip.py` e `../align-leg-extension.py`.
O normalizador inicial de traços está em `../normalize-exercise-images.py`.

## Preparação

Executar na raiz do projeto, com Python 3 e as dependências:

```powershell
python -m pip install -r scripts/exercise-sequences/requirements.txt
```

O ambiente local desta execução tem o OpenCV em `.image-sequence-runtime/`.
Não é necessário baixar modelos de pose para executar o processamento final.
As tentativas de detecção e deformação de poses foram descartadas e arquivadas
em `backups/all-exercise-sequences/experiments/`.

## Gerar, verificar e aplicar

```powershell
# Todos os exercícios; somente gera a revisão, sem modificar public.
python scripts/exercise-sequences/engine.py

# Ou regenerar um ou mais exercícios com o mesmo mecanismo.
python scripts/exercise-sequences/engine.py bicep-curl bench-press

# Montar o pacote completo, sincronizar SVGs/miniaturas e gerar galeria.
python scripts/exercise-sequences/manage.py package
python scripts/exercise-sequences/manage.py verify

# Aplicar somente depois de verificar a revisão.
python scripts/exercise-sequences/manage.py apply

# Voltar ao estado anterior a este lote, incluindo as duas correções aprovadas.
python scripts/exercise-sequences/manage.py restore
```

Entrada imutável: `backups/exercises-before-sequencing-20260922-234724/`.
O manifesto SHA-256 protege os 1.033 arquivos. `profiles.json` contém metadados e
os hashes de origem dos 906 frames. Mantenha esse backup junto dos scripts para
reproduzir o resultado. O diretório `backups/` não é versionado.

Saída: `backups/all-exercise-sequences/`. Abra `review.html` para comparar os
frames antes/depois em sincronia, filtrar exercícios e avançar quadro a quadro.
`review-*.jpg` contém folhas de contato; `candidate/<exercício>/sequence.gif`
contém a animação individual. `validation.json` e `apply-report.json` registram
as verificações e a aplicação.

Ambos os programas aceitam `--backup CAMINHO --output CAMINHO` para usar uma cópia
do mesmo backup ou outra pasta de saída. Seus hashes precisam corresponder aos
perfis. Para `package`, é necessário gerar todos os candidatos antes.

## Proteções

- Verificação completa do backup e do pacote antes da aplicação.
- Bloqueio se qualquer arquivo público tiver sido editado depois do backup/lote.
- Substituição atômica de cada arquivo, com hashes antes e depois da cópia.
- Nova aplicação é idempotente; um processo interrompido pode ser reexecutado.
- Validação de tamanho, transparência, traços brancos, bordas, área de tinta e
  preservação do número de poses distintas.
- SVGs alternativos incorporam os mesmos PNGs. São imagens raster em SVG,
  conforme a primeira padronização; os vetores originais continuam no backup inicial.
- Miniaturas avulsas só acompanham um frame quando eram cópias exatas dele;
  as demais permanecem na padronização anterior.

Os ajustes são locais e não alteram o player do aplicativo. Não execute novamente
os importadores de imagens do pacote externo após aplicar o lote.
