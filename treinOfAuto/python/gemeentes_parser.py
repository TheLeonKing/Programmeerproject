import csv
import operator

def gemeenteCodes(csvFile):
    reader = csv.DictReader(open(csvFile))
    gemeenteCodes = {}
    for row in reader:
        gName = row.pop('GM_NAAM')
        gemeenteCodes[gName] = row.pop('OBJECTID')
    return gemeenteCodes

def matchCodes(csvFile, gemeenteCodes):
    reader = csv.DictReader(open(csvFile))

    gemeenteDict = {}
    errors = []
    
    for row in reader:
        gName = row.pop('gemeente')
        
        if gName in gemeenteCodes:
            gID = gemeenteCodes[gName]
        else:
            gID = gName
            errors.append(gName)

        gemeenteDict[gID] = row.pop('2013')

    print "Kon geen codes vinden voor de volgende gemeenten:"
    print ','.join(errors)
    
    return gemeenteDict

def writeCsv(csvFile, gemeenteDict):
    writer = csv.writer(open(csvFile, 'wb'))

    writer.writerow(['id', 2013])
    
    for key, value in gemeenteDict.items():
        writer.writerow([key, value])

    print "Nieuw CSV-bestand succesvol gegenereerd."
    

gemeenteCodes = gemeenteCodes('data/gemeentes.csv')
gemeenteDict = matchCodes('data/co2_uitstoot.csv', gemeenteCodes)
writeCsv('output/co2_uitstoot_id.csv', gemeenteDict)
