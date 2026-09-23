# Padronização das ilustrações de exercícios

Para o processamento posterior de continuidade dos frames, consulte
[exercise-sequences/README.md](exercise-sequences/README.md). Ele preserva as
correções individuais aprovadas de Cadeira Extensora e Chair Dip e inclui
geração de revisão, verificação, aplicação e restauração do lote.

O processamento usa Python, Pillow e NumPy. Não gera poses novas.

- Saída PNG: 512 × 512, branco com transparência.
- Cada conjunto de três frames recebe **uma única transformação** de escala e
  translação, calculada pela união dos limites dos três desenhos. A margem-alvo
  é 32 pixels. Não se centraliza cada pose separadamente.
- Contornos duplos muito próximos são unidos, reduzidos a linhas centrais e
  renderizados com o mesmo pincel de aproximadamente 2,5 pixels, com suavização.
  Pequenos detalhes podem ser simplificados. Perspectiva e posicionamento que
  já variavam nos desenhos originais não são reconstruídos.
- As imagens avulsas que eram cópias exatas de frames reutilizam a saída do frame.
- Os SVGs alternativos incorporam o PNG correspondente para exibir exatamente
  a mesma imagem. **Não são mais vetores escaláveis sem perda.** Os SVGs vetoriais
  originais continuam no backup.

## Backup e execução

O backup desta execução está em `backups/exercises-original-20260922-224907/`.
Contém os 1.033 arquivos originais e um `manifest.json` com os hashes SHA-256.
O diretório `backups/` não é enviado ao Git nem publicado com o aplicativo.

```powershell
python scripts/normalize-exercise-images.py --backup backups/exercises-original-20260922-224907 --output backups/nova-revisao
python scripts/verify-exercise-images.py backups/nova-revisao
python scripts/normalize-exercise-images.py --backup backups/exercises-original-20260922-224907 --output backups/nova-revisao --apply
```

O destino de revisão deve ser novo. A aplicação confere hashes e não sobrescreve
um arquivo alterado depois do backup. O verificador cobre o catálogo atual de
937 PNGs, 96 SVGs e 302 conjuntos, incluindo transparência, bordas livres,
transformação comum e preservação de frames distintos.

Na pasta de revisão, `review.html` compara as animações, `comparison.jpg` mostra
amostras e `validation.json` registra os resultados. `all-frames-*.jpg` permite
examinar todos os frames. O relatório de largura usa área dividida pelo número
de pixels da linha central: é uma medida comparativa, não a largura geométrica
exata de cada segmento.

Para restaurar os originais desta execução:

```powershell
Copy-Item -Path backups/exercises-original-20260922-224907/exercises/* -Destination public/exercises -Recurse -Force
```

Executar os scripts antigos de importação de imagens pode trazer novamente os
arquivos do pacote original. Não os execute depois da padronização, a menos que
pretenda reimportar o acervo.
